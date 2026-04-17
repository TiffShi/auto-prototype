<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="text-center">
      <div class="w-24 h-24 instagram-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <svg class="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <h1 class="text-6xl font-bold text-gray-800 mb-2">404</h1>
      <h2 class="text-xl font-semibold text-gray-600 mb-2">Page Not Found</h2>
      <p class="text-gray-400 mb-8 max-w-sm mx-auto">
        Sorry, this page isn't available. The link you followed may be broken, or the page may have been removed.
      </p>
      <RouterLink to="/" class="btn-primary inline-block px-8">
        Go back to Instagram
      </RouterLink>
    </div>
  </div>
</template>