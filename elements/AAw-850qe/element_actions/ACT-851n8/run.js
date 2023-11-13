function(instance, properties, context) {
    
  let baseUrl = properties.url;
  if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
      baseUrl = context.keys["Server URL"];
  }

  if (baseUrl) {
      baseUrl = baseUrl.trim();
  }
  if (baseUrl && baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
  }

  let instancia = properties.instancia;
  if (!instancia || instancia.trim() === "") {
      instancia = context.keys["Instancia"];
  }

  var url = baseUrl + "/chat/findMessages/" + instancia;
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("uazapi", "true");
  myHeaders.append("apikey", properties.apikey);

  let where = {};
  if (properties.remoteJid) {
      where.key = { "remoteJid": properties.remoteJid };
  }

  let limite = properties.limit ? { "limit": properties.limit } : {};

  var raw = JSON.stringify({ where, ...limite });

  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
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
      instance.publishState('resultado', JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""));
      instance.triggerEvent('sucessEvent');
      instance.publishState('mensagens', resultObj);
    })
    .catch(error => {
      instance.publishState('error', true);
      try {
          let errorString = error.toString().replace(/"_p_/g, "\"");
          let errorObject = JSON.parse(errorString);
          let formattedError = JSON.stringify(errorObject, null, 2);
          instance.publishState('error_log', formattedError);
      } catch(e) {
          let errorString = error.toString().replace(/"_p_/g, "\"");
          instance.publishState('error_log', errorString);
      }
      instance.triggerEvent('errorEvent');
  });
}
