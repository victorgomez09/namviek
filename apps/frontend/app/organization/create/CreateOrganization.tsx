'use client'

import { Button, Form, FormGroup, Loading, messageError, messageWarning } from '@ui-components'
import { useFormik } from 'formik'
import { orgCreate } from '../../../services/organization'
import { Organization } from '@prisma/client'
import { useRouter } from 'next/navigation'
import EmojiInput from '@/components/EmojiInput'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { setOrgInfo } from 'apps/frontend/layouts/OrgSection'

type ErrorMessage = {
  error: string;
  message: string;
  status: number;
}

export default function CreateOrganization() {
  const { push } = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAxiosError = (err: AxiosError) => {
    const { message } = err.response?.data as ErrorMessage
    if (message === 'REACHED_MAX_ORGANIZATION') {
      messageWarning('Sorry, You have created more than 2 organization. Please contact admin to upgrade');
    } else if (message === 'DUPLICATE_ORGANIZATION') {
      messageError('The organization name already exists.');
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      desc: '',
      cover: 'https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/1f344.png',
    },
    onSubmit: values => {
      values.name = values.name.trim()

      if (!values.name) {
        messageError('Title is required !')
        return
      }

      if (values.name.length < 4) {
        messageError('Title must greater than or equal 4 characters !')
        return
      }

      if (values.name.length > 16) {
        messageError('Title must less than or equal 16 characters')
        return
      }

      setLoading(true)

      orgCreate(values).then(res => {
        const { status } = res
        const { data } = res.data
        const org = data as Organization

        if (status !== 200) {
          setLoading(false)
          messageError('Cannot create organization')
          return
        }

        console.log('res org', org)

        setOrgInfo({
          name: org.name,
          cover: org.cover || ''
        })

        push(`/${org.slug}/my-works`)
      }).catch(err => {
        const error = err as AxiosError
        handleAxiosError(error)
      }).finally(() => {
        setLoading(false)
      })
    }
  })

  const registerForm = (
    name: keyof typeof formik.values,
    handler: typeof formik
  ) => {
    return {
      name,
      error: handler.errors[name],
      value: handler.values[name],
      onChange: handler.handleChange
    }
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="org">
        <div className="org-setup relative">
          <Loading.Absolute enabled={loading} title='Submitting' />
          {/* <section className="setup-step mb-4"><span>Step 1/</span>6</section> */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-400 mb-3">
            Hey fen, 🖖
            <br /> Lets create your organization
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Tell us more about your organization so we can provide personalized
            experience tailored to your needs and preferences
          </p>

          <div className="org-form mt-4 space-y-4">
            <FormGroup title='Organization name'>
              <EmojiInput value={formik.values.cover} onChange={val => {
                formik.setFieldValue('cover', val)
              }} />

              <Form.Input
                className='w-full'
                {...registerForm('name', formik)}
              />
            </FormGroup>
            <Form.Textarea
              title="Description"
              {...registerForm('desc', formik)}
            />
            <div>
              <Button type="submit" title="Create now" primary />{' '}
              <Button onClick={() => push('/organization')} title="Back" />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
