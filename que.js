/*!
 * que.js - Lightweight viewport checker
 * v1.1.0
 * Author: choisunki <sk@daltan.net>
 * MIT License
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else {
    // Browser global
    root.que = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  /**
   * que - 간단한 viewport checker
   *
   * @example
   * // 기본 사용
   * que('.sect-1');
   *
   * @example
   * // 옵션 사용
   * que('.sect-1', {
   *   classToAdd: 'inview',     // 진입 시 추가할 클래스 (기본: 'que')
   *   classToRemove: 'outview', // 벗어날 때 추가할 클래스 (기본: null)
   *   offset: 100,              // 뷰포트 여유 px (기본: 0)
   *   once: true,               // 최초 1회만 실행 여부 (기본: true)
   *   repeat: false,            // true일 경우, 벗어났다가 다시 들어올 때 반복 실행 (기본: false)
   *   callback: function(el, action) {
   *     // action: 'add' 또는 'remove'
   *     console.log(el, action);
   *   }
   * });
   *
   * @param {string} selector - id 또는 클래스 선택자
   * @param {object} [opts] - 옵션
   * @param {string} [opts.classToAdd='que'] - 진입 시 추가할 클래스
   * @param {string|null} [opts.classToRemove=null] - 벗어날 때 추가할 클래스
   * @param {number} [opts.offset=0] - 뷰포트 여유 (px)
   * @param {boolean} [opts.once=true] - 최초 1회만 실행 여부
   * @param {boolean} [opts.repeat=false] - 반복 실행 여부
   * @param {function} [opts.callback] - 상태 변경 시 콜백 (el, action)
   * @returns {{ detach: function }} detach - 이벤트 해제 메서드
   */
  function que(selector, opts) {
    var options = Object.assign({
      classToAdd: 'que',
      classToRemove: null,
      offset: 0,
      once: true,
      repeat: false,
      callback: null
    }, opts || {});

    var el = document.querySelector(selector);
    if (!el) return;

    var activated = false;

    function activate() {
      el.classList.add(options.classToAdd);
      if (options.classToRemove) el.classList.remove(options.classToRemove);
      if (typeof options.callback === 'function') {
        options.callback(el, 'add');
      }
      activated = true;
    }

    function deactivate() {
      el.classList.remove(options.classToAdd);
      if (options.classToRemove) el.classList.add(options.classToRemove);
      if (typeof options.callback === 'function') {
        options.callback(el, 'remove');
      }
      activated = false;
    }

    function check() {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var inView = rect.top < vh - options.offset && rect.bottom > options.offset;

      if (inView && (!activated || options.repeat)) {
        activate();
        if (options.once && !options.repeat) {
          detach();
        }
      } else if (!inView && activated && options.repeat) {
        deactivate();
      }
    }

    function detach() {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    }

    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();

    return { detach: detach };
  }

  return que;
}));
