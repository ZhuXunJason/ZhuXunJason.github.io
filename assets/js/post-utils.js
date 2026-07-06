(function () {
    if (window.BlogPostUtils) return;

    function normalizeTag(tag) {
        return String(tag ?? '').trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getTagClass(tag) {
        const lowerTag = normalizeTag(tag);

        if (lowerTag === '学术' || lowerTag === 'academic') {
            return 'academic';
        }

        if (lowerTag === '生活' || lowerTag === 'life') {
            return 'life';
        }

        return 'default';
    }

    function formatYearMonth(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return String(dateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}年${month}月`;
    }

    window.BlogPostUtils = {
        escapeHtml,
        formatYearMonth,
        getTagClass,
        normalizeTag
    };
})();
