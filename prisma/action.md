na pagina app/agendamento/page.tsx, ao realizar o agendamento o sistema precissa executar os seguintes passos

1. Enviar a mensagem de confirmação de agendamento para o paciente, 
2. Colocar a tag de consulta agendada no chat do paciente (EE2DD9391D2C44568064)
3. Colocar a tag do médico responsável no contato do paciente 
    Endpont: v1/contacts/{id}/tags
    As tags do contato deve ser definida de acordo com o com o medico:
        - Dra Ana Maria=EE4163812661315C119F
        - Dra Iara=EEE0F9DD18C27A9D7241
        - Dra Jader=EE8A5F144929914A9480
        - Dra Romulo=EE5AF4B19365470E32D7
        - Dra Savio=EEB1093EAEE5BDE52936
        - Dra Tiago=EEDF632B284BED12C16E