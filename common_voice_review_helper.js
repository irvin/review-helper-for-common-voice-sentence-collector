// script to default downvote any sentences that had been downvote, and upvote others
(async () => {
  let selector = document.querySelector('select.language-selector');
  let locale = selector?.options[selector.selectedIndex].value || '';
  if (!locale) {
    return
  }

  // fixme: hijack default page request to reduce requesting
  // console.log('before fetch')
  const sentences = await fetch('https://commonvoice.mozilla.org/sentence-collector/sentences/review?locale=' + locale)
    .then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new Error('Something went wrong on api server!');
      }
    })

  // collecting sentences already been downvote by someone
  const validatedData = sentences.reduce((acc, cur) => {
    const number_of_approving_votes = cur.number_of_approving_votes || 0;
    const number_of_votes = cur.number_of_votes || 0;
    if (number_of_approving_votes != number_of_votes) {
      acc.invalidated.push(cur.id)
    } else if (number_of_votes > 0) {
      acc.validated.push(cur.id)
    }
    return acc
  }, {invalidated: [], validated: []})

  // send validatedData to API server
  const result = await fetch('https://commonvoice.mozilla.org/sentence-collector/votes', {
    method: 'PUT',
    body: JSON.stringify(validatedData),
    headers: new Headers({
      'Content-Type': 'application/json',
    })
  }).then(response => {
    if (response.status == 201) {
      return response.json();
    } else {
      console.log(response)
      throw new Error('Something went wrong on api server!');
    }
  })

  console.log(result)
  location.reload()
})();
