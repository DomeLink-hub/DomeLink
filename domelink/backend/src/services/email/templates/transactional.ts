export const renderTransactionalEmail = (title: string, summary: string, ctaText?: string, ctaUrl?: string) => {
  return `
    <div style="font-family: Inter, Arial, sans-serif; background:#f5f2ed; color:#111; padding:32px;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #ece7df;">
        <div style="font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#7b7367; margin-bottom:18px;">DomeLink</div>
        <h1 style="font-size:28px; line-height:1.15; margin:0 0 16px; color:#1c1a17;">${title}</h1>
        <p style="font-size:16px; line-height:1.7; color:#4b4338; margin:0 0 24px;">${summary}</p>
        ${ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block; background:#111; color:#fff; text-decoration:none; padding:14px 20px; border-radius:999px; font-weight:600;">${ctaText || 'View details'}</a>` : ''}
      </div>
    </div>
  `;
};
