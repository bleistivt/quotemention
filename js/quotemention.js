/*global document, window, gdn, jQuery*/

jQuery(function ($) {
    'use strict';

    // Check if an element's top is visible in the viewport.
    function inview(target) {
        target = $(target);
        return target.length && target.offset().top > window.pageYOffset;
    }


    // Find the previous comment of the mentioned user in this discussion.
    function get(mention) {
        // Extract the CommentID or DiscussionID from the parent item.
        var commentID = mention.closest('.Item')[0].id.replace(/\D+/, ''),
        // Extract the name of the mentioned user.
            username = mention[0].innerHTML.replace(/^@"?(.*?)"?$/, '$1');

        return $.getJSON(gdn.url(
            'plugin/quotemention' +
                    '/' + gdn.definition('DiscussionID') +
                    '/' + commentID +
                    '/' + encodeURIComponent(username)
        ));
    }


    // mouseenter handler: Show a tooltip and/or hightlight a post.
    function show(e) {
        var mention = $(e.currentTarget)
                // Keep track of the hover state manually for the "done" callback.
                .data('mouseOver', '1'),
            showProgress = gdn.definition('quoteMention.showProgress', true),
            target;

        if (mention.data('quoteMention')) {
            target = $(mention.data('quoteMention')).addClass('mentionHighlight');
        } else {
            get(mention)
                .done(function (data) {
                    // If the mouse is still over the element, highlight the referenced post.
                    if (mention.data('mouseOver')) {
                        target = $(data.target).addClass('mentionHighlight');

                        // Hide the tooltip if the target post is visible.
                        mention.tooltipster(inview(target) ? 'hide' : 'show');
                    }

                    mention
                        // Replace the content with the actual post.
                        .tooltipster('content', data.html)
                        // Save the target for highlighting.
                        .data('quoteMention', data.target);
                })
                .fail(function () {
                    // No post found or request failed: Remove the tooltip.
                    mention
                        .tooltipster('disable')
                        // Prevent further requests.
                        .data('quoteMention', true);
                });
        }

        // Show the tooltip if it is loading or if the post is not fully visible.
        if (!inview(target) && showProgress) {
            mention.tooltipster('show');
        }
    }


    // mouseleave handler: Hide a tooltip.
    function hide(e) {
        var mention = $(e.currentTarget)
            .tooltipster('hide')
            .data('mouseOver', '');

        $(mention.data('quoteMention')).removeClass('mentionHighlight');
    }


    // Register event handlers for all mentions on the page.
    function init() {
        var maxWidth = gdn.definition('quoteMention.maxWidth', 350),
            position = gdn.definition('quoteMention.position', 'bottom');

        // Initialized mentions get the "quoteMention" class.
        jQuery('.ItemComment .Message a:not(.quoteMention)')
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
                position: position,
                speed: 0,
                updateAnimation: false,
                theme: 'tooltipster-vanilla',
                maxWidth: maxWidth
            }).hover(show, hide);
    }


    // Search for new mentions when comments are added or changed.
    $(document).on('CommentAdded CommentEditingComplete CommentPagingComplete', init);
    init();

});
