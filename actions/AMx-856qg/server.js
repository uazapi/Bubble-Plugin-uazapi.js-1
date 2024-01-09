async function(properties, context) {
    //▶️ Editar Lead - Chat

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

    let apikey = properties.apikey;
    if (!apikey || apikey.trim() === "") {
        apikey = context.keys["Global APIKEY"];
    }

    if (apikey) {
        apikey = apikey.trim();
    }

    let instancia = properties.instancia;
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }

    const url = `${baseUrl}/chat/editChat/${instancia}`;

    const headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "uazapi": "true",
        "apikey": apikey
    };

    const leadInfo = {};


    // Separando as tags fornecidas pelo usuário em um array  
    if (properties.deleteTags) {
      leadInfo.tags = [];
    } else if (properties.tags) {
      let tags = properties.tags.split('|').map(tag => tag.trim());
      if (tags.length > 0) {
        leadInfo.tags = tags;
      }
    }
    
    let editedLabels = null;
    if (properties.labels && properties.editLabels) { //existe labels e tá configurado para editar labels
        editedLabels = properties.labels.split('|').map(label => label.trim());
    }
  
    if(properties.desativadoFluxoAte != null ) leadInfo.desativadoFluxoAte = properties.desativadoFluxoAte;
    if(properties.nome) leadInfo.nome = properties.nome.trim();
    if(properties.nomecompleto) leadInfo.nomecompleto = properties.nomecompleto.trim();
    if(properties.email) leadInfo.email = properties.email.trim();
    if(properties.cpf) leadInfo.cpf = properties.cpf.trim();
    if(properties.status) leadInfo.status = properties.status.trim();
    if(properties.notas) leadInfo.notas = properties.notas.trim();
    if(properties.atendimentoAberto != null) leadInfo.atendimentoAberto = properties.atendimentoAberto;
    if(properties.responsavelid) leadInfo.responsavelid = properties.responsavelid.trim();
    if(properties.customFields) {
    try {
        leadInfo.customFields = JSON.parse(properties.customFields);
    } catch (e) {
        leadInfo.customFields = [];
        console.log('Erro ao analisar customFields: ', e);
    }
    }

  const raw = {
    "_id": properties.id
};

if(properties.unreadcount != null ) raw.unreadcount = properties.unreadcount;

if(Object.keys(leadInfo).length > 0) raw.leadInfo = leadInfo;
    
    // Adicionar 'editedLabels' a 'raw' se existir e não estiver vazio
    if (editedLabels) {
        raw.editedLabels = editedLabels;
    }


    

    let response, resultObj;
    let error = false;
    let error_log;

    try {
        response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(raw)
        });
        resultObj = await response.json();
    } catch(e) {
        error = true;
        error_log = e.toString();
    }

    if (!response.ok) {
        error = true;
        return {
            error: error,
            error_log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        };
    }

    return {
        chat: resultObj,
        error: error,
        log: JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""),
        error_log: error_log
    };
}

