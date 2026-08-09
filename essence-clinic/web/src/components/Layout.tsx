import Sidebar from './Sidebar';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
}
