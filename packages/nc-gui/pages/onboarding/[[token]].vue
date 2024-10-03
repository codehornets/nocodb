<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form'
import { DollarOutlined, LoadingOutlined, SmileOutlined, SolutionOutlined, UserAddOutlined } from '@ant-design/icons-vue'

definePageMeta({
  requiresAuth: true,
})

const { $e } = useNuxtApp()
const route = useRoute()
const { signIn, user } = useGlobal()
const { api, isLoading, error } = useApi({ useGlobalInstance: true })
const { t } = useI18n()
const { navigateToTable } = useTablesStore()
const { clearWorkspaces } = useWorkspace()

const current = ref(0)
const formValidator = ref()
const subscribe = ref(false)
const userProfile = ref('individuals')

const form = reactive({
  email: user?.value?.email,
  website: '',
  linkedin: '',
  goals: '',
})

const formRules = {
  website: [
    { required: false, message: t('msg.error.signUpRules.websiteRequired') },
    {
      validator: (_: unknown, v: string) => {
        return new Promise((resolve, reject) => {
          const isValidUrl = v && v.startsWith('http') && v.includes('.')
          if (isValidUrl) return resolve()
          reject(new Error(t('msg.error.signUpRules.websiteInvalid')))
        })
      },
      message: t('msg.error.signUpRules.websiteInvalid'),
    },
  ] as RuleObject[],
  linkedin: [
    { required: false, message: t('msg.error.signUpRules.linkedinRequired') },
    {
      validator: (_: unknown, v: string) => {
        return new Promise((resolve, reject) => {
          const isValidUrl = v && v.startsWith('https://linkedin.com/in/')
          if (isValidUrl) return resolve()
          reject(new Error(t('msg.error.signUpRules.linkedinInvalid')))
        })
      },
      message: t('msg.error.signUpRules.linkedinInvalid'),
    },
  ] as RuleObject[],
  goals: [{ required: false, message: t('msg.error.signUpRules.goalsRequired') }] as RuleObject[],
}

const steps = [
  {
    title: 'Profile',
    subtitle: `Hey there 👋`,
    icon: SolutionOutlined,
    description: "We just need a few details, and you'll be on your way.",
  },
  {
    title: 'Goals',
    subtitle: 'What are you looking to achieve?',
    icon: SmileOutlined,
    description: 'We will use this to personalize your 🤖copilot.',
  },
  {
    title: 'Subscription',
    subtitle: 'Pick a plan, No credit card required',
    icon: DollarOutlined,
    description: '🚀 Start your 7-day Free Trial!',
  },
]

function handleNext() {
  if (!formValidator.value.validate()) return
  current.value++

  console.log('handleNext current', current.value)

  switch (current.value) {
    case 0:
      break
    case 1:
      handleProfileSubmission()
      break
    case 2:
      handleGoalsSubmission()
      break
    default:
      break
  }
}

async function handleProfileSubmission() {
  console.log('handleProfileSubmission', form)

  try {
    const businessProfile = await api.auth.businessProfile(form)
    console.log('businessProfile', businessProfile)
  } catch (e) {
    console.error('Error generating business profile', e)
  }
}

async function handleGoalsSubmission() {
  console.log('handleGoalsSubmission', form)
}

async function handleOnboarding() {
  if (!formValidator.value.validate()) return

  resetError()

  const data: any = {
    ...form,
    token: route.params.token,
  }

  data.ignore_subscribe = !subscribe.value

  // api.auth
  //   .onboarding(data)
  //   .then(async (user) => {
  //     signIn(user.token!)

  //     $e('a:auth:onboarding')

  //     try {
  //       // TODO: Add to swagger
  //       const base = (user as any).createdProject
  //       const table = base?.tables?.[0]

  //       if (base && table) {
  //         return await navigateToTable({
  //           baseId: base.id,
  //           tableId: table.id,
  //           workspaceId: 'nc',
  //         })
  //       }
  //     } catch (e) {
  //       console.error(e)
  //     }

  //     await navigateTo({
  //       path: '/',
  //       query: route.query,
  //     })
  //   })
  //   .catch((e) => {
  //     console.error('Error onboarding', e)
  //   })

  try {
    isLoading.value = true // Show loading spinner
    const user = await api.auth.onboarding(data)
    signIn(user.token!)

    $e('a:auth:onboarding')

    const base = (user as any).createdProject
    const table = base?.tables?.[0]

    console.log('onboarding base', base)
    console.log('onboarding table', table)

    if (base && table) {
      return await navigateToTable({
        baseId: base.id,
        tableId: table.id,
        workspaceId: 'nc',
      })
    }

    await navigateTo({
      path: '/',
      query: route.query,
    })
  } catch (e) {
    console.error('Error during onboarding:', e)
  } finally {
    isLoading.value = false // Hide loading spinner
  }
}

function resetError() {
  if (error.value) error.value = null
}

onMounted(async () => {
  await clearWorkspaces()
  // Autofill for quicker data entry
  form.website = user?.value?.website || 'https://codehornets.com'
  form.linkedin = user?.value?.linkedin || 'https://linkedin.com/in/codehornets'
  form.goals = user?.value?.goals || 'I want to generate more leads.'
})
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="md:bg-primary bg-opacity-5 signup h-full min-h-[600px] flex flex-col justify-center items-center">
        <div
          class="bg-white mt-[60px] relative flex flex-col justify-center gap-2 w-full max-w-[500px] mx-auto p-8 md:(rounded-lg border-1 border-gray-200 shadow-xl)"
        >
          <LazyGeneralNocoIcon class="color-transition hover:(ring ring-accent ring-opacity-100)" :animate="isLoading" />

          <h1 class="prose-2xl font-bold self-center my-4">
            {{ steps[current].subtitle }}
          </h1>

          <h2 class="prose !text-primary font-semibold self-center">
            {{ steps[current].description }}
          </h2>

          <!-- Image for the subscription step -->
          <div v-if="current === 2" class="image-container my-4" items-center alt="Unsplash Image">
            <img
              src="https://media.istockphoto.com/id/1218808441/photo/portrait-of-wasteful-rich-girl-in-checkered-shirt-scattering-dollars-with-arrogant-grimace.jpg?s=1024x1024&w=is&k=20&c=tRRHYTqfX4ogNl87PSJsmaltd0hDaCuxkFnvHEQ_kMQ="
              alt="Unsplash Image"
              class="img-fluid rounded-image"
            />
          </div>

          <a-form ref="formValidator" :model="form" layout="vertical" no-style>
            <a-steps v-model:current="current">
              <a-step title="Profile">
                <template #icon>
                  <LoadingOutlined v-if="current === 0" />
                  <SolutionOutlined v-else />
                </template>
              </a-step>
              <a-step title="Goals">
                <template #icon>
                  <LoadingOutlined v-if="current === 1" />
                  <MaterialSymbolsCheckCircleOutline v-else />
                </template>
              </a-step>
              <a-step title="Account">
                <template #icon>
                  <LoadingOutlined v-if="current === 2" />
                  <UserAddOutlined v-else />
                </template>
              </a-step>
            </a-steps>

            <div class="steps-content mt-8">
              <Transition name="layout">
                <div
                  v-if="error"
                  class="self-center mb-4 bg-red-500 text-white rounded-lg w-3/4 mx-auto p-1"
                  data-testid="nc-signup-error"
                >
                  <div class="flex items-center gap-2 justify-center">
                    <MaterialSymbolsWarning />
                    <div class="break-words">{{ error }}</div>
                  </div>
                </div>
              </Transition>
              <!-- Profile Step -->
              <div v-if="current === 0">
                <a-form-item :label="$t('labels.website')" name="website" :rules="formRules.website">
                  <a-input
                    v-model:value="form.website"
                    size="large"
                    :placeholder="$t('msg.info.signUp.enterWebsite')"
                    @focus="resetError"
                  >
                  </a-input>
                </a-form-item>

                <a-form-item :label="$t('labels.linkedin')" name="linkedin" :rules="formRules.linkedin">
                  <a-input
                    v-model:value="form.linkedin"
                    size="large"
                    :placeholder="$t('msg.info.signUp.enterLinkedin')"
                    @focus="resetError"
                  >
                  </a-input>
                </a-form-item>
              </div>

              <!-- Goals Step -->
              <div v-if="current === 1">
                <div class="flex flex-col items-center justify-center gap-4 mb-8 w-full">
                  <a-textarea
                    v-model:value="form.goals"
                    :rows="6"
                    placeholder="Describe your goals (max 1500 characters)"
                    :maxlength="1500"
                  />
                </div>
              </div>

              <!-- Subscription Step -->
              <div v-if="current === 2">
                <div class="flex flex-col items-center justify-center gap-4 mb-8 w-full">
                  <a-radio-group v-model:value="userProfile" button-style="solid">
                    <a-radio-button value="individuals">Free</a-radio-button>
                    <a-radio-button value="teams">Contact Sales <b>+1 (514) 603-3255</b></a-radio-button>
                  </a-radio-group>
                </div>
              </div>

              <!-- Final Submit Button -->
              <div>
                <div class="self-center flex flex-col flex-wrap gap-4 items-center mt-4">
                  <button v-if="current === 2" class="scaling-btn bg-opacity-100" @click="handleOnboarding">
                    <span class="flex items-center gap-2">
                      {{ $t('general.takeme') }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </a-form>

          <!-- Continue Button for Non-final Steps -->
          <div v-if="current !== 2">
            <div class="self-center flex flex-col flex-wrap gap-4 items-center mt-4">
              <button class="scaling-btn bg-opacity-100" @click="handleNext">
                <span class="flex items-center gap-2">
                  <MaterialSymbolsArrowForward />
                  {{ $t('general.continue') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
.signup {
  .ant-input-affix-wrapper,
  .ant-input {
    @apply !appearance-none my-1 border-1 border-solid border-primary border-opacity-50 rounded;
  }

  .password {
    input {
      @apply !border-none !m-0;
    }
  }
}
</style>
