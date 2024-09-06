const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/repos', (req, res) => {
	const repoName = req.query.repoName;
	const owner = req.query.owner;
	const numActivePRs = req.query.currentNumPRs;

	const responseObj = {
		numActivePRs: numActivePRs,
		repoName: repoName,
		owner: owner
	}

	res.json(responseObj);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});