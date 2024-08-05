import { FlowCanvas } from './components/workspace/FlowCanvas';
import Sidebar from './components/workspace/Sidebar';
import Header from './components/workspace/Header';

function App() {
  return (
    <>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <FlowCanvas />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;