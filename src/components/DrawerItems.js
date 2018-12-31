import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import TouchableItem from 'react-navigation-drawer/dist/views/TouchableItem';
import { SafeAreaView } from 'react-navigation';

const DrawerItemContainer = ({
  children, drawerPosition, style, itemStyle, ...props
}) => (
  <TouchableItem accessible delayPressIn={0} {...props}>
    <SafeAreaView
      style={style}
      forceInset={{
        [drawerPosition]: 'always',
        [drawerPosition === 'left' ? 'right' : 'left']: 'never',
        vertical: 'never',
      }}
    >
      <View style={[styles.item, itemStyle]}>{children}</View>
    </SafeAreaView>
  </TouchableItem>
);

// Other schedule route names are in the format Schedule1...50
const otherScheduleKeyRegex = /Schedule(\d+)/;
/**
 * Custom drawer item component to handle other schedules, 
 * see ReactNavigation.DrawerItems
 */
const DrawerItems = ({
  items,
  activeItemKey,
  activeTintColor,
  activeBackgroundColor,
  inactiveTintColor,
  inactiveBackgroundColor,
  getLabel,
  renderIcon,
  onItemPress,
  itemsContainerStyle,
  itemStyle,
  labelStyle,
  activeLabelStyle,
  inactiveLabelStyle,
  iconContainerStyle,
  drawerPosition,

  // For additional schedule display
  otherSchedules,
  // When a 'dynamic' schedule route is pressed
  onSchedulePress,
}) => (
  <View style={[styles.container, itemsContainerStyle]}>
    {
      items.map((route, index) => {
        const focused = activeItemKey === route.key;
        const color = focused ? activeTintColor : inactiveTintColor;
        const backgroundColor = focused ? activeBackgroundColor : inactiveBackgroundColor;
        const scene = { route, index, focused, tintColor: color };
        const extraLabelStyle = focused ? activeLabelStyle : inactiveLabelStyle;

        const sharedProps = {
          key: route.key,
          drawerPosition,
          style: { backgroundColor },
          itemStyle,
        };
        const compoundLabelStyle = [
          styles.label, 
          { color },
          labelStyle,
          extraLabelStyle,
        ];

        // Hack to show 'dynamic routes'
        if (route.key.startsWith('Schedule')) {
          // Index here signifies index in otherSchedules array as string, not index in route.key
          // First element of captured groups is whole string, not index
          const [, otherScheduleIndex] = route.key.match(otherScheduleKeyRegex);
          const specificSchedule = otherSchedules[Number(otherScheduleIndex)];
          if (specificSchedule) {
            const { name } = specificSchedule;
            return (
              <DrawerItemContainer {...sharedProps} onPress={() => onSchedulePress(route.key, specificSchedule)}>
                <View style={[styles.icon, iconContainerStyle]} />
                <Text style={compoundLabelStyle}>{name}</Text>
              </DrawerItemContainer>
            );
          }

          // If not found in otherSchedules array, hide
          return null;
        }

        // Icons, labels, etc. for regular routes in drawer
        const icon = renderIcon(scene);
        const label = getLabel(scene);
        const accessibilityLabel = typeof label === 'string' ? label : undefined;

        return (
          <DrawerItemContainer 
            {...sharedProps} 
            accessibilityLabel={accessibilityLabel}
            onPress={() => onItemPress({ route, focused })}
          >
            {
              icon
                ? <View style={[
                    styles.icon,
                    focused ? null : styles.inactiveIcon,
                    iconContainerStyle,
                  ]}>{icon}</View>
                : null
            }
            {
              typeof label === 'string'
                ? <Text style={compoundLabelStyle}>{label}</Text>
                : label
            }
          </DrawerItemContainer>
        );
      }) 
    }
  </View>
);

DrawerItems.defaultProps = {
  activeTintColor: '#2196f3',
  activeBackgroundColor: 'rgba(0, 0, 0, .04)',
  inactiveTintColor: 'rgba(0, 0, 0, .87)',
  inactiveBackgroundColor: 'transparent'
};

const styles = StyleSheet.create({
  container: { paddingVertical: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginHorizontal: 16,
    width: 24,
    alignItems: 'center'
  },
  inactiveIcon: { opacity: 0.62 },
  label: {
    margin: 16,
    fontWeight: 'bold'
  },
});

export default DrawerItems;