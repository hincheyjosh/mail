document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  


  // By default, load the inbox
  load_mailbox('inbox');
});

function sendEmail(event) {
  const form = document.querySelector("#compose-form")

  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector("#compose-subject").value
  const body = document.querySelector("#compose-body").value

  fetch('/emails', {
    method: 'POST', 
    body: JSON.stringify({
      recipients: recipients,
      subject: subject, 
      body: body
    })
  })
  .then(() => {
    load_mailbox("sent")
    document.querySelector('#compose-view').style.display = 'none'
    document.querySelector('#emails-view').style.display = 'block'
    form.removeEventListener('submit', sendEmail)
  })
}

function load_email(id) {
  // Show message view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'block';

  // Send request to get the email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    const message = document.querySelector("#message-view")
    message.innerHTML =`
    <div>
      <ul class="emailHeader">
        <li><b>From: </b>${email.sender}</li>
        <li><b>To: </b>${email.recipients}</li>
        <li><b>Subject: </b>${email.subject}</li>
        <li><b>Timestamp: </b>${email.timestamp}</li>
        <li><button onclick="reply(${id})" class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
        ${email.archived ? 
          `<button class="btn btn-sm btn-outline-primary" onclick='unarchive(${id})'>Unarchive</button>`:
        `<button class="btn btn-sm btn-outline-primary" onclick='archive(${id})'>Archive</button>`}</li>
        <li><hr style="width: 100%;"></li>
        <li><p>${email.body}</p></li>
      </ul>
    </div>
    `
  })
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function reply(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#message-view').style.display = 'none';

  document.querySelector("#composeHeader").innerHTML = "Reply"

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector("#compose-recipients").value = `${email.sender}`
    document.querySelector("#compose-subject").value = `Re: ${email.subject}`
    document.querySelector("#compose-body").value = `"On ${email.timestamp} ${email.sender} wrote: ${email.body}"`

    const form = document.querySelector("#compose-form")

    form.addEventListener("submit", sendEmail)
  })
}


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#message-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector("#composeHeader").innerHTML = "New Email"


  const form = document.querySelector("#compose-form")

  form.addEventListener("submit", sendEmail)
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';



  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      emails.forEach(email => {
        const message = document.createElement("div");
        message.className = 'message';
        message.innerHTML += `<b class="sender">${email.sender}</b><span class="subject">${email.subject}</span><span
        class="timestamp">${email.timestamp}</span>`
        message.addEventListener('click', function() {
          load_email(email.id)
        })
        if (email.read === true) {
          message.style.background = "#B0B0B0"
        }
        document.querySelector("#emails-view").append(message)
      })        
  });
}

function archive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(() => load_mailbox('inbox')
  )}

function unarchive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  .then(() => load_mailbox('inbox')
  )}