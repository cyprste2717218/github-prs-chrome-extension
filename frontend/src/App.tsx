import { useEffect, useState } from 'react'
import HeaderComponent from './components/HeaderComponent';
import StepComponent from './components/StepComponent';
import FooterComponent from './components/FooterComponent';
import type { RepoCardComponentDetails, ActiveNumPRs } from './models/RepoCardModels'
import './App.css'


function App() {

  useEffect(() => {
    console.log('selectedRepos:', selectedRepos)
  }, [])

  const [username, setUsername] = useState<string>('')
  const [step, setStep] = useState<number>(1)
  const [repoDetails, setRepoDetails] = useState<RepoCardComponentDetails[] | null>(null) 
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]) 
  const [activeNumPRs, setActiveNumPRs] = useState<ActiveNumPRs[]>([])

  return (
    <>
      <HeaderComponent setStepState={setStep} currentStep={step} />
      
      <StepComponent setSelectedRepos={setSelectedRepos} setUsername={setUsername} setRepoDetails={setRepoDetails} setStep={setStep} username={username} repoDetails={repoDetails} step={step} selectedRepos={selectedRepos} activeNumPRs={activeNumPRs} /> 

      <FooterComponent setStepState={setStep} currentStep={step} setActiveNumPRs={setActiveNumPRs} activeNumPRs={activeNumPRs} repoOwner={username}/>
    </>
  )
}

export default App
