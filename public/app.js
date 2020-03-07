// Grab the articles as a json
$.get("/api/article", function (data) {
  // For each one
  for (const article of data) {
    const card = `<div class="col-sm-4">
      <div class="card articleCard">
        <div class="card-body">
          <h5 class="card-title"><a href="${article.link}">${article.title}</a></h5>
          <p class="card-text">${article.summary}</p>
          <button href="#" data-articleid="${article._id}" class="btn btn-outline-primary commentButton">Add/View Comments</button>
        </div>
      </div>
    </div>`
    $("#articles").append(card);
  }
  $('button.commentButton').click(function (e) {
    e.preventDefault()
    const articleId = $(this).attr('data-articleid')

    $.get('/api/article/' + articleId, function (articleData) {
      refreshCommentsInModal(articleData)
    })
  })
  $('#newCommentButton').click(function (e) {
    e.preventDefault()
    const articleId = $('#modalBody').attr('data-articleid')
    const comment = {
      body: $('#commentBodyInput').val(),
      username: $('#usernameInput').val()
    }
    if (!comment.body || !comment.username) {
      alert('Please fill in both fields before submitting new comment')
      return;
    }
    $('#commentBodyInput').val('')
    $('#usernameInput').val('')
    console.log('posting comment', comment)
    $.post(`/api/article/${articleId}/comment`, comment, function (articleData) {
      console.log('we got the data back woo!', articleData)
      refreshCommentsInModal(articleData)
    })
  })

});

function refreshCommentsInModal(article) {
  let commentsHtml = ''
  // Save the article id in the modal so we can use it when the add comment button is clicked
  $('#modalBody').attr('data-articleid', article._id)
  $('#modalTitle').text(`Comments for "${article.title.substr(0, 30)}..."`)
  for (const comment of article.comments) {
    commentsHtml = `${commentsHtml}
        <div class="row">
          <div class="col-sm-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">${comment.username}</a></h5>
                <p class="card-text">${comment.body}</p>
                <button href="#" data-articleid="${article._id}" data-commentid="${comment._id}" class="btn btn-outline-danger deleteCommentButton">Delete</button>
              </div>
            </div>
          </div>
        </div>`
  }
  $('#existingComments').empty()
  if (article.comments.length === 0) commentsHtml = '<p>No one has commented yet...<p>'
  $('#existingComments').append(commentsHtml)
  $('#commentsModal').modal('show')
  setupDeleteClickHandlers()
}

function setupDeleteClickHandlers() {
  $('button.deleteCommentButton').click(function (e) {
    e.preventDefault()
    console.log('clicked delete')
    const articleId = $(this).attr('data-articleid')
    const commentId = $(this).attr('data-commentid')
    const confirmed = confirm('Are you sure you want to delete this comment?')
    if (confirmed) {
      $.ajax({
        url: `/api/article/${articleId}/comment/${commentId}`,
        type: 'DELETE',
        success: function (articleData) {
          console.log('successfully deleted', commentId)
          refreshCommentsInModal(articleData)
        }
      })
    }
  })
}

