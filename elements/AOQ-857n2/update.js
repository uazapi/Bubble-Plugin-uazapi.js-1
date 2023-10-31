function(instance, properties, context) {

// Inicie uma conexão SSE para uma URL especificada.
const evtSource = new EventSource(properties.server_url);

// Defina o tratamento de eventos para quando uma mensagem é recebida.
evtSource.onmessage = function(event) {
    // Aqui, 'event.data' contém a mensagem recebida do servidor.
    const receivedData = JSON.parse(event.data); // Assumindo que os dados são enviados como JSON.

    // Você pode agora fazer algo com os dados recebidos. Por exemplo, atualizar algum elemento no Bubble ou chamar uma função.
    // Se o Bubble tiver um método ou API que você possa chamar para atualizar a UI ou disparar alguma ação, você faria isso aqui.

    // Exemplo (hipotético):
    // Bubble.updateElement("myElementId", receivedData); 
};

// Tratar possíveis erros.
evtSource.onerror = function(err) {
    console.error("Ocorreu um erro com o EventSource:", err);
    evtSource.close(); // Você pode optar por fechar a conexão em caso de erro.
};

// Se você precisar fechar a conexão SSE manualmente em algum ponto (por exemplo, quando o usuário sai da página), você pode usar:
// evtSource.close();

    

}