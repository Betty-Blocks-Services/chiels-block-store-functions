import _ from 'lodash';
import Liquid from './liquid.min';

const mapAttachments = (attachmentsMap, attachmentsCol, attachmentProp) => {
  const attachments = [];
  attachmentsMap.map(({ key, value }) => {
    if (!value) return;
    if (!key) return;
    attachments.push({ filename: key, path: value && value.url ? value.url : value });
  });

  if (attachmentsCol && attachmentsCol.data) {
    const prop = attachmentProp[0].name;
    attachmentsCol.data.map((item) => {
      const fileName = item[prop].name;
      const fileUrl = item[prop].url && item[prop].url ? item[prop].url : item[prop];
      attachments.push({ filename: fileName, path: fileUrl });
    });
  }

  return attachments;
};


const sendEmail = async ({
  host,
  port,
  username,
  password,
  secure,
  senderEmail,
  senderName,
  toEmail,
  toName,
  cc,
  bcc,
  subject,
  body,
  variables,
  attachments,
  attachmentsCol,
  attachmentsColProperty,
  replyTo,
}) => {
  const smtpCredentials = {
    host,
    port,
    username,
    password,
    secure,
  };


  const engine = new Liquid();

  engine.registerFilter('group', (collection, key) => _.groupBy(collection, key));

  const renderedBody = engine.parseAndRenderSync(
    body,
    variables.reduce((ctx, { key, value }) => {
      ctx[key] = value;
      return ctx;
    }, {}),
  );

  // throw JSON.stringify(variables);
  // const variableMap = variables.reduce((previousValue, currentValue) => {
  //   previousValue[currentValue.key] = currentValue.value;
  //   return previousValue;
  // }, {});


  const mappedAttachments = mapAttachments(attachments, attachmentsCol, attachmentsColProperty);

  const mail = {
    sender: {
      from: senderName ? `"${senderName}" ${senderEmail}` : senderEmail,
      name: senderName,
      replyTo,
    },
    recipient: {
      to: toName ? `"${toName}" ${toEmail}` : toEmail,
      cc: cc,
      bcc: bcc,
    },
    subject,
    body: renderedBody,
    attachments: mappedAttachments,
  };



  const sentMail = await smtp(smtpCredentials, mail);

  return {
    result: sentMail,
  };
};
export default sendEmail;
