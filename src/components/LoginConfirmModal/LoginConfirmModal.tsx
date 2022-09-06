import { ChainType } from '@/wallets';
import { useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { useRequest } from 'ahooks';
import { Button, Modal, Space, Typography } from 'antd';

interface LoginConfirmModalProps {
  loginState:
    | {
        chainType: ChainType;
        onConfirm: (token: string) => void;
        onReject: () => void;
      }
    | undefined;
}

export default function LoginConfirmModal({
  loginState,
}: LoginConfirmModalProps) {
  const { formatMessage } = useIntl();

  const { getTokenAsync } = useModel('walletModel', (model) => ({
    getTokenAsync: model.getTokenAsync,
  }));

  const { runAsync: runGetToken, loading } = useRequest(
    async () => {
      if (!loginState?.chainType) return '';
      return await getTokenAsync(loginState.chainType, true);
    },
    {
      manual: true,
    },
  );

  return (
    <Modal
      open={!!loginState}
      closable={false}
      title={false}
      footer={null}
      centered={true}
      onCancel={() => {}}
      width={400}
    >
      <Typography.Title level={4}>
        {formatMessage({ id: 'confirm-login.tip.title' })}
      </Typography.Title>
      <Typography.Paragraph>
        {formatMessage({ id: 'confirm-login.tip.desc' })}
      </Typography.Paragraph>
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button
            disabled={loading}
            danger={true}
            onClick={() => loginState?.onReject()}
          >
            {formatMessage({ id: 'confirm-login.reject' })}
          </Button>
          <Button
            loading={loading}
            type={'primary'}
            onClick={async () => {
              const token = await runGetToken();
              if (!!token) {
                loginState?.onConfirm(token);
              }
            }}
          >
            {formatMessage({ id: 'confirm-login.confirm' })}
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
