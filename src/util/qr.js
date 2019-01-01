import { deflate } from 'pako';
import { Buffer } from 'buffer';
import fetch from 'react-native-fetch-polyfill';

import { API } from '../constants/constants';

/**
 * QR Generation pipeline:
 * Convoluted to allow for large schedules
 * 
 * schedule (JS object) --> compressed (JS object) --> binary (deflated after JSON stringified)
 * --> base64 --> POSTed to API/shorten?d={base64} (d for 'data')
 * 
 * At endpoint /shorten, a URL with schedule data is shortened via bit.ly. The id of the generated 
 * link is returned as JSON. The id (which is a bit.ly link without a protocol) is encoded as the QR code 
 * 
 * on scan --> /expand?id={id from QR code} --> bit.ly lookup retrieves the originally shortened URL with data
 * --> decodes base64 --> uncompresses data --> returns schedule
 */
const generateBase64Link = async (schedule, name) => {
  const compressed = compressSchedule(schedule, name);
  const binary = deflate(JSON.stringify(compressed));
  const base64 = Buffer.from(binary).toString('base64');
  const response = await fetch(
    `${API}/shorten?d=${encodeURIComponent(base64)}`,
    { method: 'POST' },
  );
  const { id } = await response.json();
  return id;
};

const decodeScheduleQRCode = async (id) => {
  const response = await fetch(`${API}/expand?id=${id}`);
  return response.json();
};

// Compresses for fitting into a URL.
// Since sourceId is not unique and identifiable, "title|body" is used as the ID for item lookup
// Also, since max classes is 10, using an array for search is O(n) but still only around 20 operations in worst case
// Still bad but not as bad.
const compressSchedule = (schedule, name) => schedule.reduce(([S, D, name], daySchedule) => {
  daySchedule.forEach(({
    crossSectionedBlock,
    title, day, startMod, length, sourceId, body,
  }) => {
    // Filter cross-sectioned and open mod info for extra lightweight-ness
    if (crossSectionedBlock || title === 'Open Mod') {
      return;
    }

    // Cannot compress body also, since the same course may have different rooms (large groups, etc.)
    // So title and body must be key - also hopefully | will not be in title/body.
    // sourceId - overridden so that only one is saved for compression
    const key = `${title}|${body}`;
    const index = S.findIndex(str => str.substring(0, str.lastIndexOf('|')) === key);

    if (index === -1) { // If not already exists
      // If pushed, the index will be length
      S.push(`${key}|${sourceId}`);
    }

    const pushIndex = index === -1 ? S.length - 1 : index;
    D[day - 1].push(`${pushIndex}|${startMod}|${length}`);
  });
  return [S, D, name];
}, [
  [], // S are the schedule items,
  [[], [], [], [], []], // day schedules
  name,
]);

export {
  generateBase64Link, decodeScheduleQRCode,
};
