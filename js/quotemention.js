/*global document, window, gdn, jQuery*/

jQuery(($) => {
    // Check if an element's top is visible in the viewport.
    function inview(target) {
        target = $(target);
        return target.length && target.offset().top > window.pageYOffset;
    }


    // Find the previous comment of the mentioned user in this discussion.
    function get(mention) {
        // Extract the CommentID or DiscussionID from the parent item.
        const commentID = mention.closest('.Item')[0].id.replace(/\D+/, '');

        // Extract the name of the mentioned user.
        const username = mention[0].innerHTML.replace(/^@"?(.*?)"?$/, '$1');

        return $.getJSON(gdn.url(
            'plugin/quotemention' +
                '/' + gdn.definition('DiscussionID') +
                '/' + commentID +
                '/' + encodeURIComponent(username)
        ));
    }


    // mouseenter handler: Show a tooltip and/or highlight a post.
    function show({currentTarget}) {
        const mention = $(currentTarget)
                // Keep track of the hover state manually for the "done" callback.
                .data('mouseOver', '1');

        const loaded = mention.data('quoteMention');
        const showProgress = gdn.definition('quoteMention.showProgress', true);
        let target;

        if (loaded !== undefined) {
            target = $(loaded).addClass('mentionHighlight');
        } else {
            get(mention)
                .done((data) => {
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
                .fail(() => {
                    // No post found or request failed: Remove the tooltip.
                    mention
                        .tooltipster('disable')
                        // Prevent further requests.
                        .data('quoteMention', false);
                });
        }

        // Show the tooltip if it is loading or if the post is not fully visible.
        if ((!loaded && showProgress) || (loaded && !inview(target))) {
            mention.tooltipster('show');
        }
    }


    // mouseleave handler: Hide a tooltip.
    function hide({currentTarget}) {
        const mention = $(currentTarget)
            .tooltipster('hide')
            .data('mouseOver', '');

        $(mention.data('quoteMention')).removeClass('mentionHighlight');
    }


    // Register event handlers for all mentions on the page.
    function init() {
        const maxWidth = gdn.definition('quoteMention.maxWidth', 350);
        const position = gdn.definition('quoteMention.position', 'bottom');

        // Initialized mentions get the "quoteMention" class.
        $('.ItemComment .Message a:not(.quoteMention)')
            // Only grab links that start with an @.
            .filter((ignore, {innerHTML}) => innerHTML.substring(0, 1) === '@')
            .addClass('quoteMention')
            // Initialize the tooltip with the progress animation.
            .tooltipster({
                content: '<span class="Progress"/>',
                contentAsHTML: true,
                trigger: 'custom',
                position,
                speed: 0,
                updateAnimation: false,
                theme: 'tooltipster-vanilla',
                maxWidth
            })
            .hover(show, hide);
    }


    // Search for new mentions when comments are added or changed.
    $(document).on('CommentAdded CommentEditingComplete CommentPagingComplete', init);
    init();
});
