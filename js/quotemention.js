/*global document, gdn, jQuery*/

jQuery(function ($) {
    'use strict';

    function show(e) {
        var mention = $(e.currentTarget),
            commentID,
            username;

        mention
            .tooltipster('show')
            // Tooltipster doesn't have an "isVisible" API, so we need to keep track of this manually.
            .data('tooltipOpen', '1');

        if (mention.data('quoteMention')) {
            $(mention.data('quoteMention')).addClass('mentionHighlight');
        } else {
            // Extract the CommentID or DiscussionID from the parent item.
            commentID = mention.closest('.Item')[0].id.replace(/\D+/, '');
            // Extract the name of the mentioned user.
            username = e.currentTarget.innerHTML.replace(/^@"?(.*?)"?$/, '$1');

            $.getJSON(gdn.url(
                'plugin/quotemention' +
                        '/' + gdn.definition('DiscussionID') +
                        '/' + commentID +
                        '/' + encodeURIComponent(username)
            ))

                .success(function (data) {
                    mention
                        // Replace the content with the actual post.
                        .tooltipster('content', data.html)
                        // Save the target for highlighting.
                        .data('quoteMention', data.target);

                    // If the tooltip is still open, highlight the referenced post.
                    if (mention.data('tooltipOpen')) {
                        $(data.target).addClass('mentionHighlight');
                    }
                })

                .fail(function () {
                    // No post found or request failed: Remove the tooltip.
                    mention
                        .tooltipster('disable')
                        // Prevent further requests.
                        .data('quoteMention', true);
                });
        }
    }


    function hide(e) {
        var mention = $(e.currentTarget)
            .tooltipster('hide')
            .data('tooltipOpen', '');

        $(mention.data('quoteMention')).removeClass('mentionHighlight');
    }


    function init() {
        // Initialized mentions get the "quoteMention" class.
        jQuery('.Message a:not(.quoteMention)')
            .filter(function (ignore, elem) {
                // Only grab links that start with an @.
                return elem.innerHTML.substring(0, 1) === '@';
            })
            .addClass('quoteMention')
            // Initialize the tooltip with the progress animation.
            .tooltipster({
                content: '<span class="Progress"/>',
                contentAsHTML: true,
                trigger: 'custom',
                updateAnimation: false,
                theme: 'tooltipster-vanilla',
                maxWidth: gdn.definition('quoteMention.maxWidth', 350)
            }).hover(show, hide);
    }


    // Search for new mentions when comments are added or changed.
    $(document).on('CommentAdded CommentEditingComplete CommentPagingComplete', init);
    init();

});
