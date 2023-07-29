<template>
    <div class="flex items-center justify-center gap-2 text-gray-500 cursor-progress">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 fill-current" viewBox="0 0 16 16">
            <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
        <span>
            <slot />
        </span>
        <span class="inline-block w-4 h-4 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></span>
    </div>
</template>