<?php

$PluginInfo['quotemention'] = array(
    'Name' => 'Quote Mentions',
    'Description' => 'Show a mentioned user\'s previous comment in a tooltip.',
    'Version' => '0.2',
    'Author' => 'Bleistivt',
    'AuthorUrl' => 'http://bleistivt.net',
    'License' => 'GNU GPL2'
);

class QuoteMentionPlugin extends Gdn_Plugin {

    public function assetModel_styleCss_handler($sender) {
        //$sender->addCssFile('tooltipster.css', 'plugins/quotemention');
        //$sender->addCssFile('quotemention.css', 'plugins/quotemention');
        $sender->addCssFile('quotemention.min.css', 'plugins/quotemention');
    }


    public function discussionController_initialize_handler($sender) {
        //$sender->addJsFile('jquery.tooltipster.min.js', 'plugins/quotemention');
        //$sender->addJsFile('quotemention.js', 'plugins/quotemention');
        $sender->addJsFile('quotemention.min.js', 'plugins/quotemention');

        $sender->addDefinition('quoteMention.maxWidth', (int)c('QuoteMention.MaxWidth', 350));
        $sender->addDefinition('quoteMention.position', c('QuoteMention.Position', 'bottom'));
    }


    public function pluginController_quoteMention_create($sender, $discussionID, $commentID, $username) {
        $sender->deliveryMethod(DELIVERY_METHOD_JSON);

        $user = Gdn::userModel()->getByUsername($username);
        $discussionModel = new DiscussionModel();
        $discussion = $discussionModel->getID($discussionID);

        if (!$user || !$discussion) {
            throw notFoundException();
        }

        // Make sure this endpoint can't be used to snoop around.
        $sender->permission(
            'Vanilla.Discussions.View',
            true,
            'Category',
            $discussion->PermissionCategoryID
        );

        // Find the previous comment of the mentioned user in this discussion.
        $item = Gdn::sql()->getWhere('Comment', array(
            'DiscussionID' => $discussion->DiscussionID,
            'InsertUserID' => $user->UserID,
            'CommentID <' => $commentID
        ), 'CommentID', 'desc', 1)->firstRow();

        // The items ID in the DOM used for highlighting.
        if ($item) {
            $target = '#Comment_'.$item->CommentID;
        // The mentioned user might be the discussion creator.
        } elseif ($discussion->InsertUserID == $user->UserID) {
            $item = $discussion;
            $target = '#Discussion_'.$item->DiscussionID;
        }

        if (!$item) {
            // A success response code always means that a comment was found.
            $sender->statusCode(404);
        }

        $sender->renderData($item ? array(
            'html' => nl2br(sliceString(
                Gdn_Format::plainText($item->Body, $item->Format),
                c('QuoteMention.MaxLength', 400)
            )),
            'target' => $target
        ) : array());
    }

}
