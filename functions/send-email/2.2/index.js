import _ from "lodash";
import Liquid from "../../utils/liquid.min";

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
  engine.registerFilter("group", (collection, key) =>
    _.groupBy(collection, key)
  );

  const renderedBody = engine.parseAndRenderSync(
    body,
    variables.reduce((ctx, { key, value }) => {
      ctx[key] = value;
      return ctx;
    }, {})
  );

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
    attachments: attachments
      .filter(({ value }) => value)
      .map(({ key, value }) => {
        return { filename: key, path: value && value.url ? value.url : value };
      }),
  };

  const sentMail = await smtp(smtpCredentials, mail);

  return {
    result: sentMail,
  };
};

export default sendEmail;
