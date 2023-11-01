function(instance, properties, context) {
    

    const convert = (data, param_prefix = '_p_') => {
        let addPrefix = (obj, key_parent = null, is_array = false) => {
          let result = {};
      
          Object.keys(obj).forEach(key => {
            let cell = obj[key];
            let key_new = `${param_prefix}${key}`;
      
            if (key_parent && !is_array) key_new = `${key_parent}.${key}`;
      
            if ((!cell && cell !== 0 && cell !== false) || typeof cell === 'undefined') {
              result[key_new] = null;
            } else if (typeof cell !== 'object' && !Array.isArray(cell)) {
              result[key_new] = cell;
            } else if (typeof cell === 'object' && !Array.isArray(cell)) {
              result = Object.assign(result, addPrefix(cell, key_new));
            } else if (Array.isArray(cell)) {
              if (typeof cell[0] === 'object') {
                result[key_new] = [];
                cell.forEach(value => {
                  result[key_new].push(addPrefix(value, key_new, true));
                });
              } else {
                result[key_new] = cell;
              }
            }
          });
      
          return result;
        };
      
        if (Array.isArray(data)) {
          return data.map(obj => addPrefix(obj));
        } else if (typeof data === 'object' && data !== null) {
          return addPrefix(data);
        }
      
        return {};
      };
      

      let source; // Mantenha esta variável no escopo mais amplo, fora da função startSSE
      // Inicialmente sete para false no início do código
        instance.data.sseStarted = false;
        console.log(instance.data.sseStarted);

      function startSSE() {
        if (instance.data.sseStarted) {
            console.log("SSE já foi iniciado anteriormente.");
            return; // Não executa o resto da função se o SSE já foi iniciado
        }
        
        console.log("startSSE iniciado", Date.now());
       
        instance.data.sseStarted = true; 
        console.log(instance.data.sseStarted);


          // Se uma conexão SSE já existir, feche-a
          if (source) {
              source.close();
              console.log("Conexão SSE anterior fechada");
          }
      
          const { baseUrl, instancia } = getBaseUrlAndInstance();
          const url = `${baseUrl}/events/${instancia}?events=messages,chats&apikey=${properties.apikey}`;
              
          source = new EventSource(url, {
              headers: {
                  'Content-Type': 'text/event-stream'
              }
          });
          
          source.onmessage = function(event) {
              let data = JSON.parse(event.data);
              
                // Processamento de mensagens
                if (data.message && data.message.key && data.message.key.id) {
                    console.log("msg recebida");

                    let msgConverted = convert(data.message);

                    // Verifique se instance.data e instance.data.mensagens existem e estão definidos corretamente
                    if (!instance.data) {
                        instance.data = {};
                    }
                    
                    if (!instance.data.mensagens || !Array.isArray(instance.data.mensagens)) {
                        instance.data.mensagens = [];
                    }

                    let existingMessageIndex = instance.data.mensagens.findIndex(msg => msg && msg["_p_key.id"] === msgConverted["_p_key.id"]);

                    // Se a mensagem existir, atualize-a
                    if (existingMessageIndex !== -1) {
                        console.log("msg existe");
                        instance.data.mensagens[existingMessageIndex] = msgConverted;
                    } else {
                        // Caso contrário, adicione a nova mensagem à lista
                        console.log("msg não existe");
                        instance.data.mensagens.push(msgConverted);
                    }

                    console.log(JSON.stringify(msgConverted, null, 2));
                    
                    // Atualize o estado com a nova lista de mensagens
                    instance.publishState('mensagens', instance.data.mensagens);
                }
      
              // Faça algo semelhante para os chats.
              if (data.chat && data.chat.id) {
                  console.log("chat recebido");
      
                  let chatConverted = convert(data.chat);
      
                  let existingChatIndex = instance.data.chats.findIndex(chat => chat && chat["_p_id"] === chatConverted["_p_id"]);
      
                  // Se o chat existir, atualize-o
                  if (existingChatIndex !== -1) {
                      console.log("chat existe");
                      instance.data.chats[existingChatIndex] = chatConverted;
                  } else {
                      console.log("chat não existe");
                      // Caso contrário, adicione o novo chat à lista
                      instance.data.chats.push(chatConverted);
                  }
      
                  // Atualize o estado com a nova lista de chats
                  instance.publishState('chats', instance.data.chats);
              }
          }
      
          source.onerror = function(error) {
              console.error("Error occurred with SSE:", error);
          };
      }
      
      
      
      
      
      
      


//(...)

    initialize();

    function initialize() {
        fetchChats()
            .then(() => fetchMessages())
            .catch(error => handleGlobalError(error));
    
        // Chama startSSE após 5 segundos, independentemente das chamadas anteriores
        setTimeout(startSSE, 5000);
    }
    
    function getBaseUrlAndInstance() {
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
        
        return { baseUrl, instancia };
    }

    function sendRequest(url, method = 'GET', body = null) {
        const headers = {
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "uazapi": "true",
            "apikey": properties.apikey
        };
        
        const requestOptions = {
            method: method,
            headers: headers,
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        
        instance.publishState('error', false);
        instance.publishState('error_log', '');

        return fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            });
    }


    function fetchChats() {
        const { baseUrl, instancia } = getBaseUrlAndInstance();
        const url = `${baseUrl}/chat/findChats/${instancia}`;
        return sendRequest(url)
            .then(resultObj => {
                instance.data.chats = resultObj;  
                instance.publishState('chats', resultObj);
                console.log(instance.data.chats);
                return resultObj;
            })
            .catch(error => {
                if (error.message === 'not ready') {
                    throw error;
                } else {
                    handleGlobalError(error);
                }
            });
    }

    function fetchMessages() {
        const { baseUrl, instancia } = getBaseUrlAndInstance();
        const url = `${baseUrl}/chat/findMessages/${instancia}`;
        return sendRequest(url, 'POST')
            .then(resultObj => {
               // instance.data.mensagens = resultObj;  
               // instance.publishState('mensagens', resultObj);
            })
            .catch(error => {
                if (error.message === 'not ready') {
                    throw error;
                } else {
                    handleGlobalError(error);
                }
            });
    } 

    function handleGlobalError(error) {
        console.error(error);
        instance.publishState('error', true);
        instance.publishState('error_log', error.toString());
        instance.triggerEvent('errorEvent');
    }


}