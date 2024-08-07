import { FlowCanvas } from './components/workspace/FlowCanvas';
import Sidebar from './components/workspace/Sidebar';
import Header from './components/workspace/Header';
import { FlexColumn } from './components/shared/styles/flexColumn';

function App() {
  return (
    <>
      <FlexColumn style={{ height: '100vh', overflow: 'hidden' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <FlowCanvas />
          </div>
        </div>
      </FlexColumn>
    </>
  );
}

export default App;