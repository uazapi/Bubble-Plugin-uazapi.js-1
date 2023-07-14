function(instance, properties, context) {
    //🔓 Grupo - Buscar todos
    let baseUrl = properties.url;
    if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
        baseUrl = context.keys["Server URL"];
    }

        if (baseUrl) {
    baseUrl = baseUrl.trim();
    }
    if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
    }

    let instancia = properties.instancia;
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }

  var url = baseUrl + "/group/findGroups/" + instancia + "?convert=true";
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("apikey", properties.apikey);
  


  

  var requestOptions = {
      method: 'GET',
      headers: myHeaders,

  };
  

    
   


    
    
    
instance.publishState('resultado', '');
instance.publishState('error', false);
instance.publishState('error_log', '');

fetch(url, requestOptions)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(resultObj => {
 
  instance.publishState('resultado', JSON.stringify(resultObj, null, 2));
  instance.publishState('grupos', resultObj);

})
.catch(error => {
  instance.publishState('error', true);
instance.publishState('error_log', error.toString());


});





}