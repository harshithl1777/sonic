import { ThemeProvider } from '@/context/ThemeProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/pages';
import { AuthProvider } from '@/context/AuthProvider';
import Gateway from '@/components/Gateway';
import Protected from '@/components/Protected';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import BacklogPage from '@/pages/BacklogPage';
import PendingPage from '@/pages/PendingPage';
import CompletedPage from '@/pages/CompletedPage';
import SettingsPage from '@/pages/SettingsPage';
import DashboardPage from '@/pages/DashboardPage';

function App() {
    return (
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <AuthProvider>
                <Toaster />
                <Router>
                    <Routes>
                        <Route
                            path='/auth/login'
                            element={
                                <Gateway>
                                    <LoginPage />
                                </Gateway>
                            }
                        />
                        <Route
                            path='/app/dashboard'
                            element={
                                <Protected>
                                    <Layout name='Dashboard'>
                                        <DashboardPage />
                                    </Layout>
                                </Protected>
                            }
                        />
                        <Route
                            path='/app/emails/backlog'
                            element={
                                <Protected>
                                    <Layout name='Backlog'>
                                        <BacklogPage />
                                    </Layout>
                                </Protected>
                            }
                        />
                        <Route
                            path='/app/emails/scheduled'
                            element={
                                <Protected>
                                    <Layout name='Scheduled'>
                                        <PendingPage />
                                    </Layout>
                                </Protected>
                            }
                        />
                        <Route
                            path='/app/emails/completed'
                            element={
                                <Protected>
                                    <Layout name='Completed'>
                                        <CompletedPage />
                                    </Layout>
                                </Protected>
                            }
                        />
                        <Route
                            path='/app/settings'
                            element={
                                <Protected>
                                    <Layout name='Settings'>
                                        <SettingsPage />
                                    </Layout>
                                </Protected>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
