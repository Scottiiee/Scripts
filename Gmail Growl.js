// ==UserScript==
// @name        Gmail Growl
// @namespace   http://nleach.com
// @description Gmail Growl Notification for Fluid.
// @include     https://mail.google.com/*
// ==/UserScript==

(function () {
	if (!window.fluid) { return; }
	
	// Insert jQuery into the page
	var q=document.createElement('script'); q.setAttribute('src','https://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js'); document.body.appendChild(q);

	// Global vars
	var unreadMsgCount = -1;	// Counter for unread messages
	var $mail = new Array();	// jQuery DOM object for the Gmail iframe's contents
								// Initialize as an Array so we can check its length
	
	// Script options
	var initialDelay = 8;		// seconds to wait for the first check
	var pollInterval = 30;		// seconds to wait between checks
	var priority = 1;			// Growl preference
	var sticky = false;			// Growl preference
	var trimLength = 150;		// Max number of characters to show for sender, subject and message body
	
	// Gmail selectors (change somewhat frequently)
	var inboxSelector = 'a.n0[title^=Inbox]';
	var unreadMessageSelector = 'tr.zA.zE';
	var senderSelector = 'span.zF';
	var subjectSelector = '.y6 span:first';
	var bodySelector = '.y2';

	function growlNewMessages() {

		var oldCount = unreadMsgCount;

		// Make sure jQuery has been loaded (if it hasn't yet, it might be on the next pass)
		if (jQuery){
			if(!$mail.length){ $mail = jQuery('#canvas_frame').contents(); }
			
			// Extract the number of unread messages
			matches = $mail.find(inboxSelector).text().match(/\((\d*)\)/);
		}
	
		if (matches) {
			unreadMsgCount = matches[1];
		} else {
			unreadMsgCount = 0;
		}

		// If the unread message count is greater than it was the last
		// time we checked, we know that we've received one or more new
		// messages.
		if(oldCount == -1){
			fluid.showGrowlNotification({
				title: 'New Mail!',
				description: unreadMsgCount + ' total unread',
				priority: priority,
				sticky: sticky
			});
		} else if (unreadMsgCount > oldCount) {
			// Counter for the number of new message growls displayed
			var currentMsg = 0;
			
			// Helper function to set all the text lengths to something reasonable for a growl notification
			var prepText = function($field){
				return $field.text().substring(0, trimLength);
			};
	
			// Iterate over the unread messages and display a growl notification for the NEW unread messages
			$mail.find(unreadMessageSelector).each(function(){
				if(++currentMsg > (unreadMsgCount - oldCount)){ return false; } // We're only going to show you the NEW unread messages
				
				fluid.showGrowlNotification({
					title: 'New Mail From ' + prepText($(this).find(senderSelector)),
					description: prepText($(this).find(subjectSelector)) + prepText($(this).find(bodySelector)),
					priority: priority,
					sticky: sticky
				});
			});
		}
	}

	
	// Check for new messages every pollInterval seconds

	// Run the 1st check, likely sooner than the pollInterval
	setTimeout(function(){ growlNewMessages(); }, initialDelay * 1000);

	// Keep checking at a longer interval
	setInterval(function(){ growlNewMessages(); }, pollInterval * 1000);
	
})();
