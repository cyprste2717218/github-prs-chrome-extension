import { useEffect, useState } from 'react'
import HeaderComponent from './components/HeaderComponent';
import StepComponent from './components/StepComponent';
import FooterComponent from './components/FooterComponent';
import type { RepoCardComponentDetails, ActiveNumPRs } from './models/RepoCardModels'
import './App.css'


function App() {

  const [username, setUsername] = useState<string>('')
  const [step, setStep] = useState<number>(1)
  const [repoDetails, setRepoDetails] = useState<RepoCardComponentDetails[] | null>(null) 
  const [activeNumPRs, setActiveNumPRs] = useState<ActiveNumPRs[]>([])


  useEffect(() => {
    console.log('repoDetails here:', repoDetails);
    console.log('activeNumPRs here:', activeNumPRs);
  }, [repoDetails, activeNumPRs])

  return (
    <>
      <HeaderComponent setStepState={setStep} currentStep={step} />

      <StepComponent setUsername={setUsername} setRepoDetails={setRepoDetails} setStep={setStep}setActiveNumPRs={setActiveNumPRs} username={username} repoDetails={repoDetails}  step={step}  activeNumPRs={activeNumPRs} /> 

      <FooterComponent setStepState={setStep} currentStep={step} setActiveNumPRs={setActiveNumPRs} activeNumPRs={activeNumPRs} repoOwner={username}/>
    </>
  )
}

export default App
