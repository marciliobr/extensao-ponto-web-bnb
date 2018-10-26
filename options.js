let page = document.getElementById('buttonDiv');
  const tipoJornada = ['6h', '8h', 'Ambas'];
  function constructOptions(tipoJornada) {
    for (let item of tipoJornada) {
      let button = document.createElement('button');
      var text = document.createTextNode(item);
      button.appendChild(text);            
      button.addEventListener('click', function() {
        chrome.storage.sync.set({jornada: item}, function() {
          console.log('jornada escolhida ' + item);
        })
      });
      page.appendChild(button);
    }
  }
  constructOptions(tipoJornada);