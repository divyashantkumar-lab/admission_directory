import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import StudentList from './pages/StudentList';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<StudentList />} />
        <Route path="/students" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

