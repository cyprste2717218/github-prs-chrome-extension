import { ChangeEvent, useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [repoDetails, setRepoDetails] = useState({}) 

  type RepoCardComponentDetails = {
    name: string;
    clone_url: string;
  }


  async function handleFetchUserRepos() {

    if (!username) {
      console.warn('No username entered')
      return;
    }

    const results = await fetch(`https://api.github.com/users/${username}/repos`)
      .then((response) => response.json())
    
    if (results?.length > 0) {
      const relevantDetails = results.map((repo: any) => {
        return {
          name: repo.name,
          clone_url: repo.clone_url,
        }
      }
      )

      setRepoDetails(relevantDetails)

    }    
   }

   const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event?.target?.value) {
      return;
    }

    setUsername(event?.target?.value);

  };

  const RepoCardComponent = (repo : RepoCardComponentDetails) => {
    return (
      <a href={repo.clone_url}>
        <div>
          <h3>{repo.name}</h3>
        </div>
      </a>
    )
  }

  const generatedRepoCards = () => {
    return (
      repoDetails.map((repo: RepoCardComponentDetails) => {
        return (
          <RepoCardComponent name={repo.name} clone_url={repo.clone_url} />
        )
      })
    )
  }

  return (
    <>
    {
      !repoDetails && 
        <div>
          <h2>Enter Your Github Username</h2>
          <input type="text" placeholder='e.g. @rollingwolf238' value={username} onChange={(e) => handleUserNameChange(e)}></input>
          <button onClick={() => handleFetchUserRepos()} type='submit'>Submit</button>
        </div>
    }
    
    </>
  )
}

export default App
