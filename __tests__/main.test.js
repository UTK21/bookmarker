/**
 * @jest-environment jsdom
 */

// DOM must exist before main.js is required, because main.js attaches an
// event listener at the top level on load.
document.body.innerHTML = `
  <form id="myform">
    <input id="Sitename" type="text" value="" />
    <input id="SiteURL"  type="text" value="" />
    <button type="submit">Submit</button>
  </form>
  <div id="bookMarkResults"></div>
`;

global.alert = jest.fn();

const { validateForm, addhttp, saveBookmark, fetchBookmarks, deleteBookmark } =
  require('../js/main.js');

beforeEach(() => {
  localStorage.clear();
  document.getElementById('bookMarkResults').innerHTML = '';
  document.getElementById('Sitename').value = '';
  document.getElementById('SiteURL').value = '';
  global.alert.mockClear();
});

// ---------------------------------------------------------------------------
// addhttp
// ---------------------------------------------------------------------------
describe('addhttp', () => {
  test('prepends http:// when no protocol is present', () => {
    expect(addhttp('example.com')).toBe('http://example.com');
  });

  test('leaves http:// URLs unchanged', () => {
    expect(addhttp('http://example.com')).toBe('http://example.com');
  });

  test('leaves https:// URLs unchanged', () => {
    expect(addhttp('https://example.com')).toBe('https://example.com');
  });

  test('leaves ftp:// URLs unchanged', () => {
    expect(addhttp('ftp://example.com')).toBe('ftp://example.com');
  });
});

// ---------------------------------------------------------------------------
// validateForm
// ---------------------------------------------------------------------------
describe('validateForm', () => {
  test('returns false and alerts when site name is empty', () => {
    expect(validateForm('', 'http://example.com')).toBe(false);
    expect(global.alert).toHaveBeenCalledWith('Please fill in the form');
  });

  test('returns false and alerts when URL is empty', () => {
    expect(validateForm('Example', '')).toBe(false);
    expect(global.alert).toHaveBeenCalledWith('Please fill in the form');
  });

  test('returns false and alerts when URL format is invalid', () => {
    expect(validateForm('Example', 'notaurl')).toBe(false);
    expect(global.alert).toHaveBeenCalledWith('Please use a valid URL');
  });

  test('returns true for valid name and URL', () => {
    expect(validateForm('Google', 'google.com')).toBe(true);
    expect(global.alert).not.toHaveBeenCalled();
  });

  test('returns true when URL already has https://', () => {
    expect(validateForm('GitHub', 'https://github.com')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// saveBookmark
// ---------------------------------------------------------------------------
describe('saveBookmark', () => {
  const fakeEvent = { preventDefault: jest.fn() };

  test('saves the first bookmark when localStorage is empty', () => {
    document.getElementById('Sitename').value = 'Google';
    document.getElementById('SiteURL').value = 'google.com';

    // Give fetchBookmarks something to render so it doesn't crash
    localStorage.setItem('bookmarks', '[]');
    saveBookmark(fakeEvent);

    const stored = JSON.parse(localStorage.getItem('bookmarks'));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual({ name: 'Google', URL: 'google.com' });
  });

  test('appends to existing bookmarks', () => {
    localStorage.setItem('bookmarks', JSON.stringify([
      { name: 'GitHub', URL: 'github.com' }
    ]));

    document.getElementById('Sitename').value = 'Google';
    document.getElementById('SiteURL').value = 'google.com';

    saveBookmark(fakeEvent);

    const stored = JSON.parse(localStorage.getItem('bookmarks'));
    expect(stored).toHaveLength(2);
    expect(stored[1]).toEqual({ name: 'Google', URL: 'google.com' });
  });

  test('calls preventDefault on the event', () => {
    const e = { preventDefault: jest.fn() };
    localStorage.setItem('bookmarks', '[]');
    document.getElementById('Sitename').value = 'Test';
    document.getElementById('SiteURL').value = 'test.com';
    saveBookmark(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// fetchBookmarks
// ---------------------------------------------------------------------------
describe('fetchBookmarks', () => {
  test('renders a bookmark name and visit link', () => {
    localStorage.setItem('bookmarks', JSON.stringify([
      { name: 'Google', URL: 'google.com' }
    ]));

    fetchBookmarks();

    const html = document.getElementById('bookMarkResults').innerHTML;
    expect(html).toContain('Google');
    expect(html).toContain('http://google.com');
  });

  test('renders the correct number of bookmark cards', () => {
    localStorage.setItem('bookmarks', JSON.stringify([
      { name: 'Google', URL: 'google.com' },
      { name: 'GitHub', URL: 'github.com' },
      { name: 'MDN',    URL: 'developer.mozilla.org' }
    ]));

    fetchBookmarks();

    const cards = document.getElementById('bookMarkResults').querySelectorAll('.well');
    expect(cards).toHaveLength(3);
  });

  test('clears the results before re-rendering', () => {
    localStorage.setItem('bookmarks', JSON.stringify([{ name: 'A', URL: 'a.com' }]));
    fetchBookmarks();
    localStorage.setItem('bookmarks', JSON.stringify([{ name: 'B', URL: 'b.com' }]));
    fetchBookmarks();

    const cards = document.getElementById('bookMarkResults').querySelectorAll('.well');
    expect(cards).toHaveLength(1);
    expect(document.getElementById('bookMarkResults').innerHTML).toContain('B');
    expect(document.getElementById('bookMarkResults').innerHTML).not.toContain('A');
  });
});

// ---------------------------------------------------------------------------
// deleteBookmark
// ---------------------------------------------------------------------------
describe('deleteBookmark', () => {
  test('removes the matching bookmark from localStorage', () => {
    localStorage.setItem('bookmarks', JSON.stringify([
      { name: 'Google', URL: 'google.com' },
      { name: 'GitHub', URL: 'github.com' }
    ]));

    deleteBookmark('google.com');

    const stored = JSON.parse(localStorage.getItem('bookmarks'));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('GitHub');
  });

  test('does not remove anything when URL is not found', () => {
    localStorage.setItem('bookmarks', JSON.stringify([
      { name: 'Google', URL: 'google.com' }
    ]));

    deleteBookmark('notexist.com');

    const stored = JSON.parse(localStorage.getItem('bookmarks'));
    expect(stored).toHaveLength(1);
  });

  test('handles deletion of the only bookmark', () => {
    localStorage.setItem('bookmarks', JSON.stringify([
      { name: 'Google', URL: 'google.com' }
    ]));

    deleteBookmark('google.com');

    const stored = JSON.parse(localStorage.getItem('bookmarks'));
    expect(stored).toHaveLength(0);
  });
});
