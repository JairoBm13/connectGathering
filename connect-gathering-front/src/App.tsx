import { useState } from "react";
import  Onboarding  from './components/Onboarding';
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const handleOnboardingComplete = (userData) => {
    setUser(userData);
    console.log(userData)
    setIsOnboarded(true);
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }
  return <Dashboard user={user} setUser={setUser}/>
}

export default App;
