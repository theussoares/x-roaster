<template>
  <main class="min-h-screen w-full flex items-stretch p-6 gap-6">
    <!-- Left Sidebar Control Panel -->
    <aside class="w-[400px] hidden lg:block">
      <ProductEditorControlPanel />
    </aside>

    <!-- Main Editor View -->
    <section class="flex-1 glass rounded-3xl relative flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="p-8 flex justify-between items-center z-10">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">X-Roaster <span class="text-primary">Custom</span></h1>
            <p class="text-text-muted">Modelo: Camiseta Tradicional Masculina</p>
        </div>
        <div class="flex gap-4">
            <NuxtLink to="/pg" class="btn-primary py-2 px-4 text-sm" style="text-decoration:none">
              ⛪ PG Connect
            </NuxtLink>
            <NuxtLink to="/fishing" class="btn-primary py-2 px-4 text-sm" style="text-decoration:none">
              🎣 Jogo da Pesca
            </NuxtLink>
            <div class="flex items-center gap-2 px-4 py-2 rounded-full border border-border-color bg-black/20">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-xs font-medium uppercase tracking-widest">3D Preview Ativo</span>
            </div>
        </div>
      </header>

      <!-- Mockup Viewer -->
      <div class="flex-1 flex items-center justify-center p-12">
        <ProductEditorMockup />
      </div>

      <!-- Footer Info -->
      <footer class="p-8 mt-auto flex justify-between items-end z-10">
        <div class="flex gap-8">
            <div class="space-y-1">
                <span class="text-[10px] text-text-muted uppercase tracking-[0.2em]">Material</span>
                <p class="text-sm font-semibold">100% Algodão Premium</p>
            </div>
            <div class="space-y-1">
                <span class="text-[10px] text-text-muted uppercase tracking-[0.2em]">Entrega Estimada</span>
                <p class="text-sm font-semibold">3-5 Dias Úteis</p>
            </div>
        </div>

        <div class="text-right">
            <span class="text-text-muted text-sm line-through">R$ 129,90</span>
            <p class="text-4xl font-bold">R$ 89,90</p>
        </div>
      </footer>

      <!-- Background Decoration -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full"></div>
    </section>

    <!-- Mobile Drawer (simplified for MVP) -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 p-4 z-50">
        <div class="glass rounded-2xl p-4 flex justify-between items-center">
            <span class="font-bold">Personalizar Camisa</span>
            <button class="btn-primary py-2 px-4 text-sm">Abrir Editor</button>
        </div>
    </div>
  </main>
</template>

<script setup lang="ts">
// T-shirt editor page
</script>
