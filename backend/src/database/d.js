const emailjs = require('@emailjs/node');

// Конфигурация (лучше хранить в переменных окружения)
const config = {
  serviceID: 'service_vcaxptx',
  templateID: 'template_91c1fvw',
  userID: 'aoak44iftoobsH4Xm', // ваш Public Key
  accessToken: 'QoJHeYJNHPEdSvm1QXa3r' // ваш Private Key
};

// Данные для шаблона
const templateParams = {
  код_авт: "e" // параметр, который ожидает ваш шаблон
  // Добавьте другие параметры, которые использует ваш шаблон
};

// Отправка письма
emailjs.send(config.serviceID, config.templateID, templateParams, {
  publicKey: config.userID,
  privateKey: config.accessToken // только для Node.js!
})
.then(response => {
  console.log('Email успешно отправлен!', response.status, response.text);
})
.catch(error => {
  console.error('Ошибка отправки:', error);
});
