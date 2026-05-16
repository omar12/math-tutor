import { Routes, Route, Navigate } from 'react-router'
import HomeScreen from './screens/HomeScreen'
import LessonScreen from './screens/LessonScreen'
import PracticeScreen from './screens/PracticeScreen'
import ParentScreen from './screens/ParentScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/lesson" element={<LessonScreen />} />
      <Route path="/practice/:lessonId" element={<PracticeScreen />} />
      <Route path="/parent" element={<ParentScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
