import { useState } from 'react'
import HeaderComponent from './components/HeaderComponent';
import StepComponent from './components/StepComponent';
import type { RepoCardComponentDetails } from './models/RepoCardModels'
import './App.css'


function App() {
  const [username, setUsername] = useState<string>('')
  const [step, setStep] = useState<number>(1)
  const [repoDetails, setRepoDetails] = useState<RepoCardComponentDetails[]>([]) 
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]) 

  return (
    <>
      <HeaderComponent setStepState={setStep} currentStep={step} />
      <StepComponent setSelectedRepos={setSelectedRepos} setUsername={setUsername} setRepoDetails={setRepoDetails} setStep={setStep} username={username} repoDetails={repoDetails} step={step} selectedRepos={selectedRepos} />  
    </>
  )
}

export default App
