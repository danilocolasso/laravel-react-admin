import React, { useState, useEffect } from 'react'

import { Row, Table, Tag, Modal, Button, Form, Popconfirm, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { ROLES } from '../../variables'

import UserForm from './UserForm'
import LoadingContent from '../Loading/LoadingContent'
import { appContext } from '../../contexts/AppProvider'
import { useAuth } from '../../contexts/AuthProvider'

import * as service from '../../services/UserService'

function UserList() {
  const [form] = Form.useForm()
  const [users, setUsers] = useState([])
  const [loadingContent, setLoadingContent] = useState(true)
  const { loading } = appContext()
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    user: null
  })
  const authUser = useAuth().user

  const axiosError = e => {
    loading(false)
    const errors = e.response.data.errors
    Object.entries(errors).forEach(([key, error]) => {
      error.forEach(value => {
        message.error(value)
      })
    });
  }

  const actions = {
    create: () => {
      setModal({
        visible: true,
        title: 'Criar usuário',
        data: null
      })
    },
    edit: user => {
      setModal({
        visible: true,
        title: 'Editar usuário',
        user: user
      })
    },
    store: async user => {      
      try {
        loading(true)
        const response = await service.store(user)
        loading(false)
        setUsers([...users, {...response.data.data, key: response.data.data.id}])
        setModal({
          ...modal,
          visible: false
        })
        form.resetFields()
        message.success('Usuário criado com sucesso!')
      } catch (e) {
        return axiosError(e)
      }
    },
    update: async user => {
      try {
        loading(true)
        const response = await service.update(user)
        loading(false)
        setUsers(users.map(obj => (response.data.data.id == obj.id ? {...response.data.data, key: response.data.data.id} : obj)))
        setModal({
          ...modal,
          visible: false
        })
        message.success('Usuário alterado com sucesso!')
      } catch (e) {
        return axiosError(e)
      }
    },
    destroy: async user => {
      try {
        loading(true)
        const response = await service.destroy(user)
        loading(false)
        setUsers(users.filter(u => u.id != user.id))
        message.success('Usuário Excluído com sucesso!')
      } catch (e) {
        return axiosError(e)
      }
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Tipo',
      dataIndex: 'roles',
      key: 'roles',
      render: roles => {
        return (
          roles.includes(ROLES.admin) 
            ? <Tag color={'processing'}>Administrador</Tag> 
            : <Tag colr={'default'}>Normal</Tag>
        )
      }
    },
    {
      key: 'action',
      render: user => (
        user.id == 1 ? null : //First admin user can't be modified
        <>
        <a style={{ marginRight: '10px' }} onClick={() => { actions.edit(user) }}><EditOutlined/> Editar</a>
        <Popconfirm
          title={'Tem certeza que deseja excluir este usuário?'}
          cancelText={'Não'}
          okText={'Sim'}
          onConfirm={() => { actions.destroy(user) }}
        >
          <a><DeleteOutlined/> Excluir</a>
        </Popconfirm>
        </>
      )
    },
  ]

  const loadUsers = async () => {
    const response = await service.all()
      
    let data = response.data
    
    Object.entries(data).forEach(([key, value]) => {
      data[key].key = data[key].id
    })

    setUsers(data.filter(u => u.id != authUser.id))
    setLoadingContent(false)
  }

  const onFinish = values => {
    if(modal.user) {
      actions.update({...values, id: modal.user.id})
    } else {
      actions.store(values)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
      loadingContent ? <LoadingContent/> : 
        <>
        <Row justify={'end'} style={{ marginBottom: 10 }}>
          <Button onClick={actions.create} type={'primary'}><PlusOutlined/> Adicionar</Button>
        </Row>
        <Table columns={columns} dataSource={users} pagination={{hideOnSinglePage: true, pageSize: 10}}/>
        <Modal
          visible={modal.visible}
          closable={false}
          title={modal.title}
          cancelText={'Cancelar'}
          okText={'Salvar'}
          onOk={ form.submit }
          onCancel={() => {
            setModal({
              ...modal,
              visible: false
            })
          }}
          afterClose={() => {
            setModal({
              ...modal,
              user: null,
              title: ''
            })
          }}
        >
          <UserForm user={modal.user} onFinish={onFinish} form={form}/>
        </Modal>
        </>
  )
}

export default UserList