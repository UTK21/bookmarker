//event for form submit
document.getElementById("myform").addEventListener('submit' , saveBookmark);

function saveBookmark(e)
{   
    e.preventDefault();

    //getting the form values
    var site_name = document.getElementById("Sitename").value;
    
    var URL_tag = document.getElementById("SiteURL").value;
    var bookmark = {
        name : site_name,
        URL : URL_tag
    }
// storing in local storage

// basic tests
//    localStorage.setItem('test','helloWorls');
//    console.log(localStorage.getItem('test'));

   if(localStorage.getItem('bookmarks')===null) // first element
   {
       var arr = [];
       //add bookmark to array
       arr.push(bookmark);
       localStorage.setItem('bookmarks',JSON.stringify(arr));
   }
   else{
       //take the array,add the new input to it,then place it back
       var arr = JSON.parse(localStorage.getItem('bookmarks'));
       arr.push(bookmark);
       localStorage.setItem('bookmarks',JSON.stringify(arr));
   }

   document.getElementById('myForm').reset();
   // Re-fetch bookmarks
   fetchBookmarks();
   
}
function fetchBookmarks()
   {
    var arr = JSON.parse(localStorage.getItem('bookmarks'));
    // take the output
   var output= document.getElementById('bookMarkResults')
   output.innerHTML=' ';
   for(var i=0;i<arr.length;i++)
   {
       var name = arr[i].name;
       var url=arr[i].URL;
       output.innerHTML +='<div class="well">'+
       '<h3>'+name+
       ' <a class="btn btn-default" target="_blank" href="'+addhttp(url)+'">Visit</a> ' +
       ' <a onclick="deleteBookmark(\''+url+'\')" class="btn btn-danger" href="#">Delete</a> ' +
       '</h3>'+
       '</div>';
                              
   }
   }
   function deleteBookmark(url){
    // Get bookmarks from localStorage
    var bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    // Loop through the bookmarks
    for(var i =0;i < bookmarks.length;i++){
      if(bookmarks[i].url == url){
        // Remove from array
        bookmarks.splice(i, 1);
      }
    }
    localStorage.setItem('bookmarks',JSON.stringify(bookmarks));
    // Re-fetch bookmarks
   fetchBookmarks();
}
function validateForm(siteName, siteUrl){
    if(!siteName || !siteUrl){
      alert('Please fill in the form');
      return false;
    }
  
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
  
    if(!siteUrl.match(regex)){
      alert('Please use a valid URL');
      return false;
    }
  
    return true;
  }
  
  function addhttp(url) {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = "http://" + url;
    }
    return url;
  }