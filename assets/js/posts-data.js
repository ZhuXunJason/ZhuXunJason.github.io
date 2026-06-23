(function () {
    let postsPromise = null;

    window.loadBlogPostsData = function loadBlogPostsData() {
        if (!postsPromise) {
            postsPromise = fetch('/assets/json/posts.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(posts => {
                    window.blogPostsData = Array.isArray(posts) ? posts : [];
                    return window.blogPostsData;
                })
                .catch(error => {
                    console.error('Error fetching posts data:', error);
                    window.blogPostsData = [];
                    return window.blogPostsData;
                });
        }

        return postsPromise;
    };
})();
