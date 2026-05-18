import { Routes, Route, Navigate } from 'react-router'
import HomeScreen from './screens/HomeScreen'
import LessonScreen from './screens/LessonScreen'
import PracticeScreen from './screens/PracticeScreen'
import ParentScreen from './screens/ParentScreen'
import PinScreen from './screens/PinScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/lesson" element={<LessonScreen />} />
      <Route path="/lesson/:lessonId" element={<LessonScreen />} />
      <Route path="/practice/:lessonId" element={<PracticeScreen />} />
      <Route path="/pin" element={<PinScreen />} />
      <Route path="/parent" element={<ParentScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
