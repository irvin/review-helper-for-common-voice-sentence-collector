// script to upvote everything

(() => {
  const batchPage = 30;   // num of pages per excute
  let sentence_count = 0;

  function click_and_turn(i) {
    for (let btn of document.querySelectorAll('.pager')) {
      if (btn.innerText == ">") {
        if (btn.classList.contains('active')) return 99;
        btn.click();
        return i+1;
      }
    }
  }

  function clickValid(j) {
    // console.log('checkValid', j);
    for (let $validator of document.querySelectorAll('.validator')) {
      for (let $btn of $validator.querySelectorAll('button')) {
        if ($btn.innerText == "👍") {
          $btn.click();
        }
      }
    }

    let next = click_and_turn(j);
    if (next > batchPage - 1) return;
    window.setTimeout(function(){
      clickValid(next);
    }, 500);
  }

  clickValid(0);
})();