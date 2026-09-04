import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Mouhua from './pages/Mouhua'
import MouhuaDetail from './pages/MouhuaDetail'
import Zaitan from './pages/Zaitan'
import ZaitanDetail from './pages/ZaitanDetail'
import Qianyue from './pages/Qianyue'
import QianyueDetail from './pages/QianyueDetail'
import Luodi from './pages/Luodi'
import LuodiDetail from './pages/LuodiDetail'
import Yanpan from './pages/Yanpan'
import YanpanDetail from './pages/YanpanDetail'
import Tuiku from './pages/Tuiku'
import TuikuDetail from './pages/TuikuDetail'
import Jixiao from './pages/Jixiao'
import DashboardProject from './pages/DashboardProject'
import DashboardPerf from './pages/DashboardPerf'
import Account from './pages/system/Account'
import Role from './pages/system/Role'
import Log from './pages/system/Log'
import Field from './pages/system/Field'
import Overdue from './pages/system/Overdue'
import Notice from './pages/system/Notice'
import Profile from './pages/system/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/project/zaitan" replace />} />
        <Route path="project/mouhua" element={<Mouhua />} />
        <Route path="project/mouhua/detail/:id" element={<MouhuaDetail />} />
        <Route path="project/zaitan" element={<Zaitan />} />
        <Route path="project/zaitan/detail/:id" element={<ZaitanDetail />} />
        <Route path="project/qianyue" element={<Qianyue />} />
        <Route path="project/qianyue/detail/:id" element={<QianyueDetail />} />
        <Route path="project/luodi" element={<Luodi />} />
        <Route path="project/luodi/detail/:id" element={<LuodiDetail />} />
        <Route path="project/yanpan" element={<Yanpan />} />
        <Route path="project/yanpan/detail/:id" element={<YanpanDetail />} />
        <Route path="project/tuiku" element={<Tuiku />} />
        <Route path="project/tuiku/detail/:id" element={<TuikuDetail />} />
        <Route path="performance" element={<Jixiao />} />
        <Route path="dashboard/project" element={<DashboardProject />} />
        <Route path="dashboard/perf" element={<DashboardPerf />} />
        <Route path="system/account" element={<Account />} />
        <Route path="system/role" element={<Role />} />
        <Route path="system/log" element={<Log />} />
        <Route path="system/field" element={<Field />} />
        <Route path="system/overdue" element={<Overdue />} />
        <Route path="system/notice" element={<Notice />} />
        <Route path="system/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
