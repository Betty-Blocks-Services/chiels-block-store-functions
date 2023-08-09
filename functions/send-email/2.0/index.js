import groupBy from 'lodash.groupby';
import Liquid from './liquid.min';

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
}) => {
  const smtpCredentials = {
    host,
    port,
    username,
    password,
    secure,
  };
  const engine = new Liquid();
  engine.registerFilter('group', (collection, key) => groupBy(collection, key));

  const renderedBody = engine.parseAndRenderSync(
    body,
    variables.reduce((ctx, { key, value }) => {
      ctx[key] = value;
      return ctx;
    }, {}),
  );

  // throw JSON.stringify(variables);
  const variableMap = variables.reduce((previousValue, currentValue) => {
    previousValue[currentValue.key] = currentValue.value;
    return previousValue;
  }, {});

  const mail = {
    sender: {
      from: senderName ? `"${senderName}" ${senderEmail}` : senderEmail,
      name: senderName,
    },
    recipient: {
      to: toName ? `"${toName}" ${toEmail}` : toEmail,
      cc: cc,
      bcc: bcc,
    },
    subject,
    body: renderedBody,
    attachments: attachments.map(({ key, value }) => {
      return { filename: key, path: value && value.url ? value.url : value };
    }),
  };

  const sentMail = await smtp(smtpCredentials, mail);

  return {
    result: sentMail,
  };
};

export default sendEmail;