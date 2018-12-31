import { deflate } from 'pako';
import { Buffer } from 'buffer';

import { API } from '../constants/constants';

const generateBase64Link = async (schedule, name) => {
  const compressed = compressSchedule(schedule, name);
  const binary = deflate(JSON.stringify(compressed));
  const base64 = Buffer.from(binary).toString('base64');
  const response = await fetch(
    `${API}/shorten?d=${base64}`,
    { method: 'POST' },
  );
  const { link } = await response.json();
  return link;
};

const decodeScheduleQRCode = async (link) => {
  const response = await fetch(link);
  const json = await response.json();
  return json;
};

// Compresses for fitting into a URL.
// Since sourceId is not unique and identifiable, "title|body" is used as the ID for item lookup
// Also, since max classes is 10, using an array for search is O(n) but still only around 20 operations in worst case
// Still bad but not as bad.
const compressSchedule = (schedule, name) => schedule.reduce(([S, D], daySchedule) => {
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

    const pushIndex = index === -1 ? S.length : index;
    D[day - 1].push(`${pushIndex}|${startMod}|${length}`);
  });
  return [S, D];
}, [
  [], // S are the schedule items,
  [[], [], [], [], []], // day schedules
  name,
]);

export {
  generateBase64Link, decodeScheduleQRCode,
};
