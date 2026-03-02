import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors, palette} from '../../utils/colors';
import TaskCalendar from '../components/taskCalendar';
import { fontFamilies } from '../theme/typography';
import SpashLogo from '../assets/svgs/SpashLogo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNavigation from '../navigations/BottomNavigation';
import FlowButton from '../components/FlowButton';

const HomeScreen = () => {
    const insets = useSafeAreaInsets();
        const [tasks, setTasks] = useState({
      "2026-02-24": { total: 5, completed: 3 },
      "2026-02-25": { total: 4, completed: 2 },
      "2026-02-26": { total: 2, completed: 0 },
    });
  
    const handleDateSelect = (date: string) => {
      console.log("Selected Date:", date);
    };
  
    return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: 60 + insets.bottom, backgroundColor: lightColors.secondaryBackground }]}>
      <ScrollView>
      <View style={styles.header}>
        {/* Left Logo */}
        <SpashLogo fill={lightColors.background} width={28} height={28} />
        {/* Center Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Home</Text>
        </View>
        {/* Right Menu Icon */}
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={lightColors.smallText} />
        </TouchableOpacity>
      </View>

      <TaskCalendar
        tasks={tasks}
        onDateSelect={handleDateSelect}
      />

      <View style={styles.goalsList}>
        <Image source={require('../assets/images/Goal.png')} style={styles.goalsImage} />
        <View style={styles.goalsHeading}>
          <Text style={[styles.goalsTitle, { fontFamily: fontFamilies.urbanistBold }]}>You have no goals</Text>
          <Text style={styles.goalsDescription}>Add a goal by clicking the (+) button below.</Text>
        </View>
        <View style={styles.flowButtonContainer}>
          {/* FlowButton is rendered at root level so overlay can cover full screen */}
        </View>
      </View>
</ScrollView>
      <View style={{ flex: 1 }} />
      <View style={styles.bottomContainer}>
      <BottomNavigation />
      </View>
      <FlowButton />
    </View>
  );
};
  
  export default HomeScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
        height: 70,
        backgroundColor: lightColors.secondaryBackground,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
      },
    
      logo: {
        width: 40,
        height: 40,
      },
    
      titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
      },
    
      title: {
        fontFamily: fontFamilies.urbanistBold,
        fontSize: 24,
        color: lightColors.smallText,
      },
    
      menuButton: {
        padding: 6,
      },
      goalsList: {
        width: 400,
        alignSelf: 'center',
        height: 600,
        backgroundColor: palette.gray100,
      },
      goalsImage: {
        width: 160,
        height: 160,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: 120,
      },
      goalsHeading: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 160,
      },
      goalsTitle: {
        fontSize: 24,
        fontFamily: fontFamilies.urbanistBold,
        color: lightColors.smallText,
      },
      goalsDescription: {
        fontSize: 18,
        paddingVertical: 16,
        fontFamily: fontFamilies.urbanist,
        color: lightColors.subText,
        textAlign: 'center',
      },
      flowButtonContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 100,
        backgroundColor: palette.gray100,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
      },
      bottomContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 100,
        
      },
  });