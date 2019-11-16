// script to default downvote any sentences that had been downvote, and upvote others

(() => {
  let userName = document.querySelectorAll('.profile-widget a')[0].innerText;    // user account
  let batchPage = 30;   // num of pages per excute
  let locale = location.hash && location.hash.match(/\/review\/(.*)/)[1];

  if (!userName) {
    console.error('userName undefind');
    return;
  }
  if (!locale) {
    console.error('locale not found, you\'re probably not on the review page');
    return;
  }

  let sentence_count = 0;

  fetch('https://kinto.mozvoice.org/v1/buckets/App/collections/Sentences_Meta_' + locale + '/records?has_Sentences_Meta_UserVote_' + userName + '=false&has_approved=false&_sort=createdAt')
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error('Something went wrong on api server!');
      }
    })
    .then(response => {
      let invalid = {};
      response.data.forEach(function (res) {
        if (res.invalid && res.invalid.length) {
          invalid[res.sentence] = true;
        }
      });
      return invalid;
    })
    .then(invalid => {
      console.log('had been rejected by someone: ', invalid);

      function click_and_turn(i) {
        // console.log('click_and_turn', i)

        for (let btn of document.querySelectorAll('.pager')) {
          if (btn.innerText == ">") {
            if (btn.classList.contains('active')) return 99;
            btn.click();
            return i+1;
          }
        }
      }

      function checkValid(j) {
        // console.log('checkValid', j);

        for (let $validator of document.querySelectorAll('.validator')) {
          let text = $validator.querySelectorAll('.sentence-box')[0].innerText;
          console.log(sentence_count+=1, text, 'valid:', (!invalid[text]));

          for (let $btn of $validator.querySelectorAll('.secondary')) {
            if (!invalid[text] && (text.indexOf(' ') <= -1)) {
              if ($btn.innerText == "👍") $btn.click();
            }
            else {
              if ($btn.innerText == "👎") $btn.click();
            }
          }
        }

        let next = click_and_turn(j);
        if (next >= batchPage) return;
        window.setTimeout(function(){
          checkValid(next);
        }, 500);
      }

      checkValid(0);
    });
})();
