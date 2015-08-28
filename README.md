# Quote Mentions

Vanilla plugin: Show a mentioned user's previous comment in a tooltip.

Hovering over a mention in a comment will open a tooltip showing the previous comment the referenced user has written in that discussion (if any). Aditionally, the referenced post is highlighted if it is visible in the viewport.

This mechanism works across pages.

Since users often use mentions in order to reply directly to another user, this can be used as an effective replacement for a quote system.

![functionality preview](http://cd8ba0b44a15c10065fd-24461f391e20b7336331d5789078af53.r23.cf1.rackcdn.com/www.vanillaforums.org/editor/yg/i2osh039qzlm.gif)

## Options

```php
  // Maximum width of the tooltip (pixels).
  $Configuration['QuoteMention']['MaxWidth'] = 350;
  
  // Position of the tooltip (top, bottom, left, right, top-left, ...).
  $Configuration['QuoteMention']['Position'] = 'bottom';
  
  //Maximum length of the content shown in the tooltip.
  $Configuration['QuoteMention']['MaxLength'] = 400;
```

Use the `.tooltipster-vanilla` class to style the tooltip and `.mentionHighlight` to change the highlight effect.
