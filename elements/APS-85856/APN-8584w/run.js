function(instance, properties, context) {
    
    instance.data.chat_selecionado = properties.chat_selecionado
    

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
      

      let source;
      // Inicialmente sete para false no início do código
      if (typeof instance.data.sseConnected === 'undefined' || instance.data.sseConnected !== "conectado") {
        instance.data.sseConnected = "desconectado";
        }
    
        console.log(instance.data.sseConnected);
        

      function startSSE() {
        if (instance.data.sseConnected === "iniciando" || instance.data.sseConnected === "conectado") {
            console.log("Conexão SSE já está em processo ou já foi estabelecida.");
            return; // Não executa o resto da função se o SSE já foi iniciado ou está conectado
        }
        
        console.log("startSSE iniciado", Date.now());
       
        instance.data.sseConnected = "iniciando";
        console.log(instance.data.sseConnected);


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

            // Checa se a mensagem é uma informação de conexão estabelecida
            if (data.info && data.info === "Conexão estabelecida") {
                console.log("Conexão SSE estabelecida com sucesso!");
                instance.data.sseConnected = "conectado";
                console.log(instance.data.sseConnected);
                return;  // Retorna aqui para não processar o resto da função
            }
              
            // Processamento de mensagens
            if (data.message && data.message.key && data.message.key.id) {
                //console.log("Mensagem recebida:", data.message.key.id);

                let msgConverted = convert(data.message);

                // Verifique se instance.data e instance.data.mensagens estão definidos corretamente
                if (!instance.data) {
                    instance.data = {};
                }
                
                if (!instance.data.mensagens || !Array.isArray(instance.data.mensagens)) {
                    instance.data.mensagens = [];
                }
                
                // Adicione a mensagem à lista de mensagens apenas se for do chat selecionado
                if (msgConverted["_p_key.remoteJid"] === instance.data.chat_selecionado) {
                    console.log("A mensagem pertence ao chat selecionado:", instance.data.chat_selecionado);

                    // Verifique se a mensagem já existe na lista de mensagens
                    let existingMessageIndex = instance.data.mensagens.findIndex(msg => msg["_p_key.id"] === msgConverted["_p_key.id"]);

                    // Se a mensagem já existir na lista, atualize-a
                    if (existingMessageIndex !== -1) {
                        console.log("A mensagem já existe na lista e será atualizada. ID da mensagem:", msgConverted["_p_key.id"]);
                        instance.data.mensagens[existingMessageIndex] = msgConverted;
                    } else {
                        // Caso contrário, adicione a nova mensagem à lista
                        console.log("A mensagem é nova e será adicionada à lista. ID da mensagem:", msgConverted["_p_key.id"]);
                        instance.data.mensagens.push(msgConverted);
                    }

                   

                } else {
                    console.log("A mensagem não pertence ao chat selecionado. ID do chat da mensagem:", msgConverted["_p_key.remoteJid"]);
                }

                // Log da mensagem convertida para fins de depuração
               // console.log("Dados da mensagem convertida:", JSON.stringify(msgConverted, null, 2));

               console.log("remotejid:", msgConverted["_p_key.remoteJid"]);
               console.log("Chat selecionado:", properties.chat_selecionado);
               console.log("Chat da instancia:", instance.data.chat_selecionado);

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
            
                    // Guardar temporariamente o valor de _p_msgs do chat existente
                    let existingMsgs = instance.data.chats[existingChatIndex]["_p_msgs"];
            
                    // Sobrescrever o chat
                    instance.data.chats[existingChatIndex] = chatConverted;
            
                    // Restaurar o valor de _p_msgs do chat existente
                    instance.data.chats[existingChatIndex]["_p_msgs"] = existingMsgs;
                } else {
                    console.log("chat não existe");
                    
                    // Caso contrário, adicione o novo chat à lista
                    chatConverted["_p_msgs"] = {};  // Inicializar _p_msgs como um objeto vazio
                    instance.data.chats.push(chatConverted);
                }
            
                //console.log(JSON.stringify(chatConverted, null, 2));
                // Atualize o estado com a nova lista de chats
                instance.publishState('chats', instance.data.chats);
                instance.triggerEvent('updateChat');
            }
            
          }
      
          source.onerror = function(error) {
            console.error("Error occurred with SSE:", error);
            instance.data.sseConnected = "desconectado";
        };
        
      }
      


    initialize();

    function initialize() {
        // Inicia a conexão SSE imediatamente
        startSSE();
    
        // As funções fetchChats e fetchMessages são chamadas
        // mas sem garantir que o SSE esteja conectado antes delas
        fetchChats()
            .then(() => fetchMessages())
            .catch(error => handleGlobalError(error));
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
                instance.publishState('chats', instance.data.chats);
                //console.log(instance.data.chats);
                return instance.data.chats;
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
                
                instance.data.mensagens = resultObj;
                instance.publishState('mensagens', resultObj);
                //console.log(instance.data.mensagens);
                return instance.data.mensagens;
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