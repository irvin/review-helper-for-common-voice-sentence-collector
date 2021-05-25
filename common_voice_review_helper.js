// script to default downvote any sentences that had been downvote, and upvote others
var runReview = () => {
  // let userName = document.querySelectorAll('.profile-widget a')[0].innerText;    // user account
  let batchPage = 30;   // num of pages per excute
  let selector = document.querySelector('select.language-selector');
  let locale = selector.options[selector.selectedIndex].value;

  if (!document.querySelector('a[href="#/profile"]')) {
    console.error('User not logged in');
    return;
  }
  if (!locale) {
    console.error('locale not found, you\'re probably not on the review page');
    return;
  }

  let sentence_count = 0;

  // fixme: hijack default page request to reduce requesting
  // console.log('before fetch')

  fetch('https://commonvoice.mozilla.org/sentence-collector/sentences/review?locale=' + locale)
    .then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new Error('Something went wrong on api server!');
      }
    })
    .then(response => {
      // collecting sentences already been downvote by soneone
      let invalid = {};
      let valid = {};
      response.forEach(function (res) {
        const number_of_approving_votes = res.number_of_approving_votes || 0;
        const number_of_votes = res.number_of_votes || 0;
        if (number_of_approving_votes != number_of_votes) {
          invalid[res.sentence] = true;
        } else if (number_of_votes > 0) {
          valid[res.sentence] = true;
        }
      });
      return [invalid, valid];
    })
    .then(([invalid, valid]) => {
      console.log('sentneces had been rejected by someone: ', invalid);

      function click_and_turn(i) {
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
          let text = $validator.querySelectorAll('.sentence-box>p')[0].innerText;
          console.log(sentence_count+=1, text, 'valid:', (!invalid[text]));

          // if ((locale == 'zh-HK' || locale == 'zh-TW') && (text.indexOf(' ') > 0)) {
          //   for (let $btn of $validator.querySelectorAll('.secondary')) {
          //     if ($btn.innerText == "👎") $btn.click();
          //   }
          // }

          for (let $btn of $validator.querySelectorAll('button')) {
            if ($btn.innerText == "👎" && invalid[text]) {
              if (!$btn.classList.contains('no')) {
                $btn.click();
              }
            }
            else if ($btn.innerText == "👍" && valid[text]) {
              if (!$btn.classList.contains('yes')) {
                $btn.click();
              }
            }
          }
        }

        let next = click_and_turn(j);
        if (next > batchPage - 1) return;
        window.setTimeout(function(){
          checkValid(next);
        }, 500);
      }

      checkValid(0);
    });
}
runReview()
